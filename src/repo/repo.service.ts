import { DbService } from "./db/db.service";
import { Injectable } from "@nestjs/common";
import { QueueService } from "./queue/queue.service";

@Injectable()
export class RepoService {
    constructor(
        readonly db: DbService,
        readonly queue: QueueService,
    ) {
    }
}