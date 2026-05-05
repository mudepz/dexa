import {Injectable} from "@nestjs/common";
import {sign, SignOptions, verify} from "jsonwebtoken";
import {ConstService} from "../const/const.service";

@Injectable()
export class JwtService {
    private readonly secret: string;

    constructor(private readonly constS: ConstService) {
        this.secret = this.constS.config.jwtSecret;
    }

    decode(token: string) {
        return verify(token, this.secret);
    }

    encode(payload: string | Buffer | object, expiresIn: string = '1d') {
        if (typeof payload == 'object' && expiresIn && expiresIn.trim() != '') {
            const options: SignOptions = {};
            options.expiresIn = expiresIn as SignOptions['expiresIn'];
            return sign(payload, this.secret, options);
        }

        return sign(payload, this.secret);
    }
}