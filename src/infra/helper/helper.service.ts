import {Injectable} from "@nestjs/common";
import {GeneralService} from "./general.service";

@Injectable()
export class HelperService {
    constructor(
        readonly general: GeneralService,
    ) {
    }
}