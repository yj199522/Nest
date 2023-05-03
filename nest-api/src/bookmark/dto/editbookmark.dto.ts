import { IsOptional, IsString } from "class-validator";

export class EditBookmarkDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    link?: string;

    @IsString()
    @IsOptional()
    description?: string;
}