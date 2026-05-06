import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { BaseQueue } from "./queue.base";

@Injectable()
export class Employee extends BaseQueue {
    constructor(@InjectQueue('employee') queue: Queue) {
        super(queue);
    }
}