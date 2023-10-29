# STRAPI-PROVIDER-FTP-UPLOAD

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)&nbsp;&nbsp;&nbsp;[![Donation](https://img.shields.io/static/v1?label=Donation&message=❤️&style=social)](https://github.com/soranoo/Donation)

A Strapi provider to upload files to a FTP server with connection concurrency limitation.

This package is deeply inspired and based by [strapi4-ftp-provider](https://github.com/BaptisteAg/strapi4-ftp-provider). All credits go to [BaptisteAg](https://github.com/BaptisteAg)

Give me a ⭐ if you like it.

## 🗝️ Features

- Support FTP Connection Concurrency Limitation (mainly for FTP servers with IP connection rate limit)
- Support Sentry Error Reporting (only activated when Sentry is installed and configured) 
  - [How to setup](https://market.strapi.io/plugins/@strapi-plugin-sentry)

## 📦 Requirements

- Strapi v4 or higher

## 🚀 Getting Started

### Installation 🍀

```bash
npm install strapi-provider-ftp-upload
```

Visit the [npm](https://www.npmjs.com/package/strapi-provider-ftp-upload) page.

### Configuration 🛠️

#### Provider
```typescript
// config/plugins.js or config/plugins.ts

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "strapi-provider-ftp-upload",
      providerOptions: {
        host: env("FTP_HOST"),
        port: env("FTP_PORT", 21),
        user: env("FTP_USER"),
        password: env("FTP_PASSWORD"),
        secure: env.bool("FTP_SECURE", false),
        path: env("FTP_BASE_PATH"),
        baseUrl: env("FTP_BASE_URL"),

        connectionConcurrency: env("FTP_CONNECTION_CONCURRENCY", 5), // 👈 Optional. Default to 5
        useSentry: true, // 👈 Optional. Default to false
      },
    },
  },
});
```
#### Security Middleware
```typescript
// config/middleware.js or config/middleware.ts
module.exports = ({ env }) => [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            env('FTP_BASE_URL'), // 👈 new line
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            env('FTP_BASE_URL'), // 👈 new line
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```

#### Environment Variables
```bash
# .env

FTP_HOST=cloud-provider.example.com
FTP_PORT=21
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_BASE_URL=https://ftp.mysite.com/uploads/
FTP_BASE_PATH=/uploads/
FTP_SECURE=true              # 👈 Optional
FTP_CONNECTION_CONCURRENCY=5 # 👈 Optional
```

##### Tips
| Environment Variable | Tips |
| -------------------- | ---- |
| FTP_HOST             | If you are using cloud provider, you may need to set the host to the given host name, otherwise, you set it to your FTP server host name or IP address. |
| FTP_BASE_URL         | If you set "FTP_HOST" to cloud provider host name, you may need to set this to your FTP server host name or IP address to make sure pointing to the correct domain. Otherwirse, just set to upload path, eg. "/uploads/"|
| FTP_SECURE           | Recommended if you have SSL certificate installed |
| FTP_CONNECTION_CONCURRENCY | Never put the real max connection number of your FTP server. Let's say your FTP server can handle 10 connections with the same IP simultaneously, you can set this to 2-3 to make sure there is enough buffer for other FTP operations, eg. connect the FTP server through WinSCP. |

## 🐛 Known Issues

- Waiting for your report.

## ⭐ TODO

- Waiting for your request.

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue. If you want to contribute code, please fork the repository and submit a pull request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## ☕ Donation

Love it? Consider a donation to support my work.

[!["Donation"](https://raw.githubusercontent.com/soranoo/Donation/main/resources/image/DonateBtn.png)](https://github.com/soranoo/Donation) <- click me~
