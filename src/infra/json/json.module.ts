import {Module} from "@nestjs/common";
import {ConstModule} from "../const/const.module";
import {JsonService} from "./json.service";
import {JwtService} from "./jwt.service";

@Module({
    imports: [ConstModule],
    providers: [JwtService, JsonService],
    exports: [JsonService],
})

export class JsonModule {
}