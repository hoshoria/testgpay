import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

const JWT_SECRET = process.env.JWT_SECRET || 'uc-default-secret-change-me';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
