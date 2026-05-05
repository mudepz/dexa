import {Module} from "@nestjs/common";
import {DbModule} from "./db/db.module";
import {RepoService} from "./repo.service";

@Module({
    providers: [RepoService],
    imports: [DbModule],
    exports: [RepoService],
})
export class RepoModule {
}