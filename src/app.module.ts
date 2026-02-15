import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CardsModule } from './cards/cards.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [DatabaseModule, CardsModule, AuthModule],
})
export class AppModule { }
