/**
 * A simple task queue with concurrency control and optional queue length limitation.
 */
export default class TaskQueue {
    private concurrency: number;
    private queue: (() => Promise<void>)[] = [];
    private running: number = 0;
    private queueLengthLimit: number;

    /**
     * Creates a new TaskQueue with the specified concurrency and an optional queue length limit.
     * @param options An object containing the queue configuration options.
     * @param options.concurrency The maximum number of tasks to run concurrently.
     * @param options.queueLengthLimit An optional maximum length for the queue (set to -1 for no limit).
     */
    constructor({ concurrency, queueLengthLimit = -1 }: { concurrency: number, queueLengthLimit: number }) {
        this.concurrency = concurrency;
        this.queueLengthLimit = queueLengthLimit;
    }

    /**
     * Processes the task queue, executing tasks as long as concurrency and queue length limits allow.
     */
    private async processQueue() {
        while (this.queue.length > 0 && this.running < this.concurrency) {
            const task = this.queue.shift();
            if (task) {
                this.running++;
                task().finally(() => {
                    this.running--;
                    this.processQueue();
                });
            }
        }
    }

    /**
     * Enqueues a task for execution, respecting the queue length limit.
     * @param task A function that returns a Promise representing the task to be executed.
     */
    enqueue(task: () => Promise<void>) {
        if (this.queueLengthLimit === -1 || (this.queue.length < this.queueLengthLimit)) {
            this.queue.push(task);
            this.processQueue();
        }
    }

    /**
     * Gets the number of tasks left in the queue.
     * @returns The number of tasks remaining in the queue.
     */
    getTasksLeft() {
        return this.queue.length;
    }

    /**
     * Sets the concurrency limit.
     * @param concurrency The new concurrency limit.
     */
    setConcurrency(concurrency: number) {
        this.concurrency = concurrency;
    }
}

