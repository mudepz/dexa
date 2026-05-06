import { JobsOptions, Queue } from "bullmq";

export abstract class BaseQueue {
    protected constructor(protected queue: Queue) {
    }

    async add(name: string, data: any, options?: JobsOptions) {
        await this.queue.add(name, data, options);
    }

    async remove(jobId: string) {
        await this.queue.remove(jobId)
    }
}