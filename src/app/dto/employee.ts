import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class EmployeeUpdateBody {
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

export class EmployeeUpdateFile extends EmployeeUpdateBody {
    @ApiProperty({ type: 'string', format: 'binary', isArray: false, required: false })
    file: any;
}

export class EmployeeLog {
    timestamp: Date
    employee_id: bigint
    old_value: string
    new_value: string
}