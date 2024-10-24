import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MpesaExpressService } from './mpesa-express.service';
import { CreateMpesaExpressDto } from './dto/create-mpesa-express.dto';

@Controller('mpesa-express')
export class MpesaExpressController {
  constructor(private readonly mpesaExpressService: MpesaExpressService) { }
  
  @Post()
  create(@Body() createMpesaExpressDto: CreateMpesaExpressDto) {
    return this.mpesaExpressService.stkPush(createMpesaExpressDto);
  }
}
