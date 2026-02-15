import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    password: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9_.]+$/, { message: 'Invalid Telegram username format' })
    telegramUser: string;
}
