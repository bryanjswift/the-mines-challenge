import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
} from '@nestjs/common';
import { CreateCatDto } from './cats.dto';
import { Cat } from './cat.model';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  create(@Body() data: CreateCatDto): Pick<Cat, 'id'> {
    return this.catsService.create(data);
  }

  @Get()
  @Header('Cache-Control', 'max-age=60')
  findAll(): Cat[] {
    return this.catsService.findAll();
  }

  @Get(':id')
  @Header('Cache-Control', 'max-age=60')
  findOne(@Param('id') id: string): Cat {
    return this.catsService.findById(id);
  }
}
