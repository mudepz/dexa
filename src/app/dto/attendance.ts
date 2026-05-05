import { ApiProperty } from "@nestjs/swagger";
import { Type, Expose } from "class-transformer";
import { IsDate, IsNumber, IsOptional } from "class-validator";

export class AttendaceGetQuery {
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