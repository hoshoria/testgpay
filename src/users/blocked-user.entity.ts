import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('blocked_telegram_users')
export class BlockedTelegramUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'telegram_user', type: 'varchar', length: 100, unique: true })
    telegramUser: string;

    @Column({
        name: 'blocked_at',
        type: 'timestamp',
        default: () => 'NOW()',
    })
    blockedAt: Date;
}
