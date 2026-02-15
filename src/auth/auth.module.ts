import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AdminUser } from './admin-user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

const JWT_SECRET = process.env.JWT_SECRET || 'uc-default-secret-change-me';

@Module({
    imports: [
        TypeOrmModule.forFeature([AdminUser]),
        PassportModule,
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
