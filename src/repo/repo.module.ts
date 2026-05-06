import { Module } from "@nestjs/common";
import { DbModule } from "./db/db.module";
import { RepoService } from "./repo.service";
import { QueueModule } from "./queue/queue.module";

@Module({
    providers: [RepoService],
    imports: [
        DbModule,
        QueueModule,
    ],
    exports: [RepoService],
})
export class RepoModule {
}