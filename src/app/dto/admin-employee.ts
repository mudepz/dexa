import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsOptional, IsNumber, IsString, IsEmail, IsNotEmpty } from "class-validator";
import { IsBigInt, TransformToBigInt } from "../middleware/bigint.validator";

export class AdminEmployeeGetQuery {
    @Type(() => String)
    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    keyword: string;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @ApiProperty({ required: false })
    page: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @ApiProperty({ required: false })
    limit: number;
}

export class AdminEmployeeCreateBody {
    @Type(() => String)
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty()
    email: string;

    @Type(() => String)
    @IsString()
    @IsNotEmpty()
    @Expose({ name: 'full_name' })
    @ApiProperty({ name: 'full_name' })
    fullName: string;

    @Type(() => String)
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    position: string;

    @Type(() => String)
    @IsString()
    @IsOptional()
    @Expose({ name: 'phone_number' })
    @ApiProperty({ name: 'phone_number', required: false })
    phoneNumber: string;

    @Type(() => String)
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password: string;
}

export class AdminEmployeeCreateFile extends AdminEmployeeCreateBody {
    @ApiProperty({ type: 'string', format: 'binary', isArray: false, required: false })
    file: any;
}

export class AdminEmployeeUpdateBody {
    @Type(() => String)
    @IsString()
    @IsOptional()
    @Expose({ name: 'full_name' })
    @ApiProperty({ name: 'full_name', required: false })
    fullName: string;

    @Type(() => String)
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    position: string;

    @Type(() => String)
    @IsString()
    @IsOptional()
    @Expose({ name: 'phone_number' })
    @ApiProperty({ name: 'phone_number', required: false })
    phoneNumber: string;

    @Type(() => String)
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    password: string;
}

export class AdminEmployeeUpdateFile extends AdminEmployeeUpdateBody {
    @ApiProperty({ type: 'string', format: 'binary', isArray: false, required: false })
    file: any;
}

export class AdminEmployeeGetDetailParam {
    @Type(() => BigInt)
    @IsNotEmpty()
    @IsBigInt()
    @TransformToBigInt()
    @ApiProperty()
    id: bigint;
}