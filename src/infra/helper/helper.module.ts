import {Module} from "@nestjs/common";
import {HelperService} from "./helper.service";
import {GeneralService} from "./general.service";
import {ConstModule} from "../const/const.module";

@Module({
    providers: [
        GeneralService,
        HelperService,
    ],
    exports: [HelperService],
    imports: [ConstModule]
})

export class HelperModule {
}