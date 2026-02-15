import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
    HttpCode,
    NotFoundException,
    ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { CardsService } from './cards.service';
import { SaveCardDto } from './dto/save-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cards')
export class CardsController {
    constructor(private readonly cardsService: CardsService) { }

    @Post()
    @HttpCode(200)
    async saveCard(@Body() dto: SaveCardDto, @Req() req: Request) {
        const ip =
            ((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim() ||
            (req.headers['x-real-ip'] as string) ||
            'unknown';
        await this.cardsService.save(dto, ip);
        return { success: true };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getCards(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        const p = parseInt(page || '1', 10) || 1;
        const l = parseInt(limit || '25', 10) || 25;
        const result = await this.cardsService.findAll(p, l, search || '');
        return { success: true, ...result };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteCard(@Param('id', ParseIntPipe) id: number) {
        const deleted = await this.cardsService.remove(id);
        if (!deleted) throw new NotFoundException('Card not found');
        return { success: true };
    }
}
