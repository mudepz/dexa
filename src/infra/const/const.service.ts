import { Injectable } from "@nestjs/common";
import { ConfigService } from "./config.service";

@Injectable()
export class ConstService {
    constructor(
        readonly config: ConfigService,
    ) {
    }
}