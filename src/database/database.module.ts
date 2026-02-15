import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: (process.env.DATABASE_URL || '').replace('?sslmode=require', ''),
            ssl: { rejectUnauthorized: false },
            entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
            synchronize: true,
            extra: {
                max: 5,
                connectionTimeoutMillis: 10000,
                idleTimeoutMillis: 30000,
            },
        }),
    ],
})
export class DatabaseModule { }
