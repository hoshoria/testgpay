import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveCardDto {
    @IsNotEmpty()
    @IsString()
    cardNumber: string;

    @IsOptional()
    @IsString()
    expiry?: string;
}
