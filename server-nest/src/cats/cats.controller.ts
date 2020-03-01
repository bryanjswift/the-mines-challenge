import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { IoValidationPipe } from '../io-validation.pipe';
import { CreateCatDto } from './cats.dto';
import { Cat } from './cat.model';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @UsePipes(new IoValidationPipe(CreateCatDto))
  create(@Body() data: CreateCatDto): Pick<Cat, 'id'> {
    return this.catsService.create(data);
  }

  @Get()
  @Header('Cache-Control', 'max-age=60')
  findAll(): Cat[] {
    return this.catsService.list();
  }

  @Get(':id')
  @Header('Cache-Control', 'max-age=60')
  findOne(@Param('id') id: string): Cat {
    return this.catsService.findById(id);
  }
}
