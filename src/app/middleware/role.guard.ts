import {
    CanActivate,
    ExecutionContext,
    Injectable,
    InternalServerErrorException,
    Logger,
    UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "./permission.decorator";
import { RepoService } from "../../repo/repo.service";
import { InfraService } from "../../infra/infra.service";
import { DecodedJwt } from "../dto/middleware";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly repo: RepoService,
        private readonly infra: InfraService
    ) {
    }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        if (this.infra.constS.config.environment == 'local') {
            return true;
        }

        try {
            const requiredPermissions = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            const permission = await this.repo.db.permission.getByName(null, requiredPermissions)
            if (!permission) {
                Logger.error(`permission ${requiredPermissions} not found`);
                throw new UnauthorizedException('Insufficient Role', 'RG-CA-02');
            }

            const request = context.switchToHttp().getRequest();
            const decoded = request.decoded as DecodedJwt
            Logger.debug('decoded: ', JSON.stringify(decoded, null, 2), 'RG-CA-03')
            if (!decoded.role) {
                throw new UnauthorizedException('Not Logged In', 'RG-CA-04');
            }

            if (requiredPermissions.toLowerCase().includes('admin') && !decoded.role.name.toLowerCase().includes('admin')) {
                Logger.error(`Invalid role ${decoded.role.name} for ${requiredPermissions}`, 'RG-CA-05');
                throw new UnauthorizedException('Not HR Admin', 'RG-CA-05');
            }


            const rolePermission = await this.repo.db.rolePermission.getByRoleAndPermissionId(null, decoded.role_id, permission.id)
            if (!rolePermission) {
                Logger.error(`permission ${requiredPermissions} not found for role ${decoded.role.name}`);
                throw new UnauthorizedException('Insufficient Role', 'RG-CA-05');
            }

            return true;
        } catch (e) {
            if (e instanceof UnauthorizedException) {
                throw e;
            }

            Logger.error(e instanceof Error ? e.stack : e, 'RG-CA-01');
            throw new InternalServerErrorException(e instanceof Error ? e.message : String(e), 'RG-CA-01')
        }
    }
}