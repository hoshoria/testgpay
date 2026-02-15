import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    UseGuards,
    HttpCode,
    UnauthorizedException,
    ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto) {
        const user = await this.authService.validateUser(dto.username, dto.password);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        return this.authService.login(user);
    }

    @Get('users')
    @UseGuards(JwtAuthGuard)
    async listUsers() {
        return this.usersService.findAll();
    }

    @Patch('users/:id/password')
    @UseGuards(JwtAuthGuard)
    async updateUserPassword(
        @Param('id', ParseIntPipe) id: number,
        @Body('password') password: string,
    ) {
        return this.usersService.adminUpdatePassword(id, password);
    }
}
