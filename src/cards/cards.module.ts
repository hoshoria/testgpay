import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Card } from './card.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';

const JWT_SECRET = process.env.JWT_SECRET || 'uc-default-secret-change-me';

@Module({
    imports: [
        TypeOrmModule.forFeature([Card]),
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
    ],
    controllers: [CardsController],
    providers: [CardsService],
})
export class CardsModule { }
