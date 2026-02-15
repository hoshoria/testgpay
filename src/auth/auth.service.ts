import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AdminUser } from './admin-user.entity';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '$$Tribal123';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        @InjectRepository(AdminUser)
        private readonly userRepo: Repository<AdminUser>,
        private readonly jwtService: JwtService,
    ) { }

    async onModuleInit() {
        await this.ensureAdminUser();
    }

    private async ensureAdminUser() {
        const existing = await this.userRepo.findOne({
            where: { username: ADMIN_USERNAME },
        });
        if (!existing) {
            const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
            const user = this.userRepo.create({
                username: ADMIN_USERNAME,
                passwordHash: hash,
            });
            await this.userRepo.save(user);
        }
    }

    async validateUser(
        username: string,
        password: string,
    ): Promise<AdminUser | null> {
        const user = await this.userRepo.findOne({ where: { username } });
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        return valid ? user : null;
    }

    login(user: AdminUser) {
        const payload = { userId: user.id, username: user.username };
        return { success: true, token: this.jwtService.sign(payload) };
    }
}
