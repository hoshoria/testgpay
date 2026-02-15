import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('cards')
export class Card {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'card_number', type: 'varchar', length: 30 })
    cardNumber: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    expiry: string | null;

    @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
    ipAddress: string | null;

    @Column({ name: 'ip_info', type: 'jsonb', nullable: true })
    ipInfo: Record<string, any> | null;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'NOW()',
    })
    createdAt: Date;
}
