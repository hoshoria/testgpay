import {
    Injectable,
    ConflictException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const TELEGRAM_WHITELIST = [
    'hosh1220', 'Shamir0113', 'Draxm_2025', 'yuichi0890', 'VERlFICADO',
    'LEGACiYi', 'Jenlisauwu', 'zSnoww', 'pelu420', 'Letimedina02',
    'SandroCorsaro', 'cachagordas3000', 'TakemishiKen', 'Nicole01022',
    'lightfreeworld', 'whoiam18983849', 'Rodr03', 'maikeguz', 'malandro1996',
    'Val_GRC', 'Canaimaveneca', 'Ja4el', 'PuroChokolate', 'Bryce_chz',
    'Dlowbat', 'chipox43', 'loveFamas', 'JCardenass', 'nobacrono',
    'ByCracker2', 'DavMi04', 'Elmer3623', 'La_thepy', 'JKLPT99',
    'Binners_7', 'MILENITA01', 'marinero12', 'Robertoov11', 'Dark_Play503',
    'Ossyok', 'luvjuns', 'Imaria1',
];

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto, ip: string) {
        const handle = dto.telegramUser.replace(/^@/, '');
        const isWhitelisted = TELEGRAM_WHITELIST.some(
            (w) => w.toLowerCase() === handle.toLowerCase(),
        );
        if (!isWhitelisted) {
            throw new BadRequestException('Telegram user not in whitelist');
        }

        const existingTg = await this.userRepo.findOne({
            where: { telegramUser: `@${handle}` },
        });
        if (existingTg) {
            throw new ConflictException('Telegram user already registered');
        }

        const existingUser = await this.userRepo.findOne({
            where: { username: dto.username },
        });
        if (existingUser) {
            throw new ConflictException('Username already taken');
        }

        const hash = await bcrypt.hash(dto.password, 12);
        const user = this.userRepo.create({
            username: dto.username,
            passwordHash: hash,
            telegramUser: `@${handle}`,
            ipAddress: ip,
        });
        await this.userRepo.save(user);

        const payload = { userId: user.id, username: user.username, role: 'user' };
        return { success: true, token: this.jwtService.sign(payload) };
    }

    async login(username: string, password: string) {
        const user = await this.userRepo.findOne({ where: { username } });
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const payload = { userId: user.id, username: user.username, role: 'user' };
        return { success: true, token: this.jwtService.sign(payload) };
    }

    async getProfile(userId: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        return {
            id: user.id,
            username: user.username,
            telegramUser: user.telegramUser,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
        };
    }

    async updateProfile(userId: number, dto: UpdateProfileDto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        if (dto.password) {
            user.passwordHash = await bcrypt.hash(dto.password, 12);
        }
        if (dto.profilePicture !== undefined) {
            user.profilePicture = dto.profilePicture;
        }

        await this.userRepo.save(user);
        return { success: true };
    }

    async findAll() {
        const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
        return users.map((u) => ({
            id: u.id,
            username: u.username,
            telegramUser: u.telegramUser,
            ipAddress: u.ipAddress,
            profilePicture: u.profilePicture,
            createdAt: u.createdAt,
        }));
    }

    async adminUpdatePassword(userId: number, newPassword: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        user.passwordHash = await bcrypt.hash(newPassword, 12);
        await this.userRepo.save(user);
        return { success: true };
    }
}
