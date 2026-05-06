import { Injectable } from "@nestjs/common";
import { Employee } from "./employee";

@Injectable()
export class QueueService {
    constructor(
        readonly employee: Employee,
    ) {
    }
}