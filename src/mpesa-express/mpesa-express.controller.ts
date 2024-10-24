import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MpesaExpressService } from './mpesa-express.service';
import { CreateMpesaExpressDto } from './dto/create-mpesa-express.dto';
import { UpdateMpesaExpressDto } from './dto/update-mpesa-express.dto';

@Controller('mpesa-express')
export class MpesaExpressController {
  constructor(private readonly mpesaExpressService: MpesaExpressService) {}

  @Post()
  create(@Body() createMpesaExpressDto: CreateMpesaExpressDto) {
    return this.mpesaExpressService.create(createMpesaExpressDto);
  }

  @Get()
  findAll() {
    return this.mpesaExpressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mpesaExpressService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMpesaExpressDto: UpdateMpesaExpressDto) {
    return this.mpesaExpressService.update(+id, updateMpesaExpressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mpesaExpressService.remove(+id);
  }
}
