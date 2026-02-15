import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    password?: string;

    @IsOptional()
    @IsString()
    profilePicture?: string;
}
