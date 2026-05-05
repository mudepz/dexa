import { Module } from "@nestjs/common";
import { InfraModule } from "../infra/infra.module";
import { RepoModule } from "../repo/repo.module";

@Module({
    controllers: [
    ],
    imports: [
        InfraModule,
        RepoModule,
    ],
    exports: [
        InfraModule,
        RepoModule,
    ],
    providers: [
    ],
})

export class AppModule {
}