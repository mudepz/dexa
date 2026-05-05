import {JwtService} from "./jwt.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class JsonService {
    constructor(readonly jwt: JwtService,) {
    }
}