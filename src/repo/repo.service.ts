import {DbService} from "./db/db.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class RepoService {
    constructor(
        readonly db: DbService,
    ) {
    }
}