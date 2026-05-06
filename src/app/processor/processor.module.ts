import { Module } from "@nestjs/common";
import { EmployeeProcessor } from "./employee";
import { RepoModule } from "../../repo/repo.module";
import { InfraModule } from "../../infra/infra.module";

@Module({
    providers: [
        EmployeeProcessor,
    ],
    imports: [RepoModule, InfraModule],
    exports: [],
})
export class ProcessorModule {
}