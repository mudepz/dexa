import { ApiProperty } from "@nestjs/swagger";
import { Type, Expose } from "class-transformer";
import { IsOptional, IsNumber, IsDate, IsString } from "class-validator";
import { IsBigInt, TransformToBigInt } from "../middleware/bigint.validator";

export class AdminAttendanceGetQuery {
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

    @Type(() => String)
    @IsOptional()
    @IsString()
    @Expose({ name: 'employee_name' })
    @ApiProperty({ required: false, name: 'employee_name' })
    employeeName: string;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    @Expose({ name: 'start_date' })
    @ApiProperty({ name: 'start_date', required: false })
    startDate: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    @Expose({ name: 'end_date' })
    @ApiProperty({ name: 'end_date', required: false })
    endDate: Date;
}