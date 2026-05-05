import { CanActivate, ExecutionContext, HttpException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as semver from 'semver';
import { InfraService } from "../../infra/infra.service";
import { RepoService } from '../../repo/repo.service';
import { DecodedJwt } from '../dto/middleware';

@Injectable()
export class ApiTokenGuard implements CanActivate {
    constructor(
        private readonly infra: InfraService,
        private readonly repo: RepoService,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.infra.constS.config.environment == 'local') {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header', 'G-CA-01');
        }

        const token = authHeader.split(' ')[1];

        try {
            const decodeToken = this.infra.json.jwt.decode(token);
            const decoded = decodeToken as DecodedJwt
            request.decoded = decoded;

            return true;
        } catch (err) {
            if (err instanceof HttpException) throw err;

            Logger.error(err)
            throw new UnauthorizedException('Invalid token', 'G-CA-02');
        }
    }
}