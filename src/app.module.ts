import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CardsModule } from './cards/cards.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [DatabaseModule, CardsModule, AuthModule, UsersModule],
})
export class AppModule { }
