import { Injectable } from '@nestjs/common';
import { CreateMpesaExpressDto } from './dto/create-mpesa-express.dto';
import { UpdateMpesaExpressDto } from './dto/update-mpesa-express.dto';

@Injectable()
export class MpesaExpressService {
  create(createMpesaExpressDto: CreateMpesaExpressDto) {
    return 'This action adds a new mpesaExpress';
  }

  findAll() {
    return `This action returns all mpesaExpress`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mpesaExpress`;
  }

  update(id: number, updateMpesaExpressDto: UpdateMpesaExpressDto) {
    return `This action updates a #${id} mpesaExpress`;
  }

  remove(id: number) {
    return `This action removes a #${id} mpesaExpress`;
  }
}
