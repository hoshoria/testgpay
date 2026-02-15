import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Card } from './card.entity';
import { SaveCardDto } from './dto/save-card.dto';

@Injectable()
export class CardsService {
    constructor(
        @InjectRepository(Card)
        private readonly cardRepo: Repository<Card>,
    ) { }

    async save(dto: SaveCardDto, ip: string): Promise<void> {
        let ipInfo: Record<string, any> | null = null;
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`https://ipinfo.io/${ip}/json`, {
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.ok) ipInfo = await res.json();
        } catch {
            // non-critical
        }

        const card = this.cardRepo.create({
            cardNumber: dto.cardNumber,
            expiry: dto.expiry || null,
            ipAddress: ip,
            ipInfo,
        });
        await this.cardRepo.save(card);
    }

    async findAll(page: number, limit: number, search: string) {
        const fetchAll = limit === 0 || limit > 5000;
        const qb = this.cardRepo.createQueryBuilder('c');

        if (search) {
            qb.where(
                'c.card_number ILIKE :s OR c.ip_address ILIKE :s OR c.expiry ILIKE :s',
                { s: `%${search}%` },
            );
        }

        const total = await qb.getCount();

        qb.orderBy("LEFT(REPLACE(c.card_number, ' ', ''), 6)", 'ASC')
            .addOrderBy('c.created_at', 'DESC');

        if (!fetchAll) {
            qb.skip((page - 1) * limit).take(limit);
        }

        const data = await qb.getMany();

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: fetchAll ? 1 : Math.ceil(total / limit),
            },
        };
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.cardRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
