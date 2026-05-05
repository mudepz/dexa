import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { DecodedJwt } from "../dto/middleware";

export const GetDecoded = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): DecodedJwt => {
        const request = ctx.switchToHttp().getRequest();
        return request.decoded as DecodedJwt;
    }
);