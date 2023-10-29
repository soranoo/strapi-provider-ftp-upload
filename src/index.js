const Readable = require("stream").Readable;
const ftpClient = require("basic-ftp");

const TaskQueue = require("./task-queue").default;

const taskQueue = new TaskQueue({ concurrency: 5, queueLengthLimit: -1 });

let sentryService = undefined;
try {
  sentryService = strapi.plugin("sentry").service("sentry");
} catch (error) {}

module.exports = {
  init(config) {
    const getConnection = async () => {
      taskQueue.setConcurrency(config.connectionConcurrency || 5);
      sentryService = config.useSentry ? sentryService : undefined;

      const client = new ftpClient.Client();
      await client.access({
        host: config.host,
        user: config.user,
        port: config.port,
        password: config.password,
        secure: config.secure,
      });
      return client;
    };

    const stream2buffer = async (stream) => {
      return new Promise((resolve, reject) => {
        const _buf = [];
        stream.on("data", (chunk) => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", (err) => reject(err));
      });
    };

    const uploadStream = async (inputFile) => {
      const file = { ...inputFile };
      file.buffer = await stream2buffer(file.stream);

      const path = `${config.path}${file.hash}${file.ext}`;
      const client = await getConnection();

      try {
        const source = new Readable();
        source._read = () => {}; // _read is required but you can noop it
        source.push(file.buffer);
        source.push(null);
        await client.uploadFrom(source, path);
      } catch (error) {
        sentryService?.sendError(error, (scope, sentryInstance) => {
          scope.setTag("ftp", "upload");
          scope.setLevel("error");
        });

        throw error;
      } finally {
        await client.close();
      }
    };

    const deleteFile = async (file) => {
      const path = `${config.path}${file.hash}${file.ext}`;

      await taskQueue.enqueue(async () => {
        const client = await getConnection();

        try {
          await client.remove(path);
        } catch (error) {
          const { code } = error;
          if (code === 550) {
            sentryService?.sendError(error, (scope, sentryInstance) => {
              scope.setTag("ftp", "delete");
              scope.setLevel("info");
            });
            return; // File not found, means it's already deleted
          }
          sentryService?.sendError(error, (scope, sentryInstance) => {
            scope.setTag("ftp", "delete");
            scope.setLevel("error");
          });

          throw error;
        } finally {
          await client.close();
        }
      });
    };

    return {
      async upload(file) {
        await taskQueue.enqueue(async () => await uploadStream(file));
        file.url = `${config.baseUrl}${file.hash}${file.ext}`;
        delete file.buffer;
      },
      async uploadStream(file) {
        await taskQueue.enqueue(async () => await uploadStream(file));
        file.url = `${config.baseUrl}${file.hash}${file.ext}`;
        delete file.buffer;
      },
      delete(file) {
        return new Promise((resolve, reject) => {
          deleteFile(file)
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
    };
  },
};
