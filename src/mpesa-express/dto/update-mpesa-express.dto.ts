import { PartialType } from '@nestjs/mapped-types';
import { CreateMpesaExpressDto } from './create-mpesa-express.dto';

export class UpdateMpesaExpressDto extends PartialType(CreateMpesaExpressDto) {}
