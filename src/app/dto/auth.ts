import { Expose, Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AuthLoginBody {
    @Type(() => String)
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty()
    email: string;

    @Type(() => String)
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password: string;
}