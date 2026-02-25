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
import { UAParser } from 'ua-parser-js';
import { User } from './user.entity';
import { BlockedTelegramUser } from './blocked-user.entity';
import { LoginHistory } from './login-history.entity';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

let TELEGRAM_WHITELIST = [
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
        @InjectRepository(BlockedTelegramUser)
        private readonly blockedRepo: Repository<BlockedTelegramUser>,
        @InjectRepository(LoginHistory)
        private readonly loginHistoryRepo: Repository<LoginHistory>,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto, ip: string) {
        // Strict case check
        if (!TELEGRAM_WHITELIST.includes(dto.telegramUser.replace(/^@/, ''))) {
            throw new BadRequestException('Telegram user not in whitelist (Match Case)');
        }

        const handle = dto.telegramUser.replace(/^@/, '');

        // Check if blocked
        const blocked = await this.blockedRepo.findOne({ where: { telegramUser: handle } });
        if (blocked) {
            throw new BadRequestException('Telegram user is blocked');
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

    async login(username: string, password: string, ip: string, userAgent: string) {
        const user = await this.userRepo.findOne({ where: { username } });
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Record Login History
        try {
            const parser = new UAParser(userAgent);
            const result = parser.getResult();
            const deviceInfo = {
                browser: result.browser.name,
                os: result.os.name,
                device: result.device.model || 'PC',
                cpu: result.cpu.architecture
            };

            const history = this.loginHistoryRepo.create({
                userId: user.id,
                ipAddress: ip,
                userAgent: userAgent,
                deviceInfo: deviceInfo,
            });
            await this.loginHistoryRepo.save(history);
        } catch (e) {
            console.error('Error saving login history', e);
        }

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

    async deleteUser(userId: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        // Deleting the user automatically releases the telegram username because it's just a column in the user table.
        // We just need to delete the row.
        await this.userRepo.remove(user);
        return { success: true };
    }

    async adminUpdatePassword(userId: number, newPassword: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        user.passwordHash = await bcrypt.hash(newPassword, 12);
        await this.userRepo.save(user);
        return { success: true };
    }

    async getTelegramUsernameStatus() {
        const users = await this.userRepo.find();
        const blocked = await this.blockedRepo.find();
        const blockedSet = new Set(blocked.map(b => b.telegramUser.toLowerCase()));

        const usedMap = new Map<string, string>();
        users.forEach((u) => {
            const handle = u.telegramUser.replace(/^@/, '').toLowerCase();
            usedMap.set(handle, u.username);
        });

        const available: string[] = [];
        const used: { telegramUser: string; username: string }[] = [];
        const blockedList: string[] = [];

        TELEGRAM_WHITELIST.forEach((handle) => {
            const lower = handle.toLowerCase();
            const registeredUsername = usedMap.get(lower);

            if (blockedSet.has(lower)) {
                blockedList.push(`@${handle}`);
            } else if (registeredUsername) {
                used.push({ telegramUser: `@${handle}`, username: registeredUsername });
            } else {
                available.push(`@${handle}`);
            }
        });

        return { available, used, blocked: blockedList };
    }

    async blockTelegramUser(handle: string) {
        // Strip @ if present
        const cleanHandle = handle.replace(/^@/, '');
        // Case insensitive check if it's in whitelist to ensure valid handle?
        // Actually, user said "block A telegramusername", usually implies one from the list.
        // I will just save it as is (lowercase for consistency if desired, but user asked for exact match elsewhere).
        // For blocking, usually we want to block the identity regardless of case, but let's stick to the handle string.
        // Best to store it lowercase for robust blocking check.
        const existing = await this.blockedRepo.findOne({ where: { telegramUser: cleanHandle } });
        if (existing) return { success: true }; // Already blocked

        const blocked = this.blockedRepo.create({ telegramUser: cleanHandle });
        await this.blockedRepo.save(blocked);
        return { success: true };
    }

    async unblockTelegramUser(handle: string) {
        const cleanHandle = handle.replace(/^@/, '');
        const existing = await this.blockedRepo.findOne({ where: { telegramUser: cleanHandle } });
        if (existing) {
            await this.blockedRepo.remove(existing);
        }
        return { success: true };
    }

    addTelegramUsername(handle: string) {
        const cleanHandle = handle.replace(/^@/, '').trim();
        if (!cleanHandle || !/^[a-zA-Z0-9_.]+$/.test(cleanHandle)) {
            throw new BadRequestException('Invalid Telegram username format');
        }
        const exists = TELEGRAM_WHITELIST.some(
            (h) => h.toLowerCase() === cleanHandle.toLowerCase(),
        );
        if (exists) {
            throw new ConflictException('Telegram username already in whitelist');
        }
        TELEGRAM_WHITELIST.push(cleanHandle);
        return { success: true, username: cleanHandle };
    }

    async getUserLoginHistory(userId: number) {
        return this.loginHistoryRepo.find({
            where: { userId },
            order: { loginTime: 'DESC' },
            take: 10,
        });
    }
}
