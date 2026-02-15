import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let app: any;

async function bootstrap() {
    if (!app) {
        app = await NestFactory.create(AppModule, new ExpressAdapter(server));
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    }
    return server;
}

export default async function handler(req: any, res: any) {
    const instance = await bootstrap();
    instance(req, res);
}
