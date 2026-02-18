import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Req,
    Param,
    UseGuards,
    HttpCode,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Req() req: Request) {
        const ip =
            ((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim() ||
            (req.headers['x-real-ip'] as string) ||
            'unknown';
        return this.usersService.register(dto, ip);
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: UserLoginDto, @Req() req: Request) {
        const ip =
            ((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim() ||
            (req.headers['x-real-ip'] as string) ||
            'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        const result = await this.usersService.login(dto.username, dto.password, ip, userAgent);
        if (!result) throw new UnauthorizedException('Invalid credentials');
        return result;
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: Request) {
        const user = req.user as { userId: number };
        return this.usersService.getProfile(user.userId);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: Request) {
        const user = req.user as { userId: number };
        return this.usersService.updateProfile(user.userId, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(+id);
    }

    @Post('telegram/block')
    @UseGuards(JwtAuthGuard)
    async blockTelegramUser(@Body() body: { telegramUser: string }) {
        return this.usersService.blockTelegramUser(body.telegramUser);
    }

    @Delete('telegram/block/:handle')
    @UseGuards(JwtAuthGuard)
    async unblockTelegramUser(@Param('handle') handle: string) {
        return this.usersService.unblockTelegramUser(handle);
    }

    @Get(':id/history')
    @UseGuards(JwtAuthGuard)
    async getUserLoginHistory(@Param('id') id: string) {
        return this.usersService.getUserLoginHistory(+id);
    }
}
