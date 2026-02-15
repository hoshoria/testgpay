import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    username: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ name: 'telegram_user', type: 'varchar', length: 100, unique: true })
    telegramUser: string;

    @Column({ name: 'profile_picture', type: 'text', nullable: true })
    profilePicture: string | null;

    @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
    ipAddress: string | null;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'NOW()',
    })
    createdAt: Date;
}
