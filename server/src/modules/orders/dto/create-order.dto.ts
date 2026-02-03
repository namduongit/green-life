import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export enum PaymentMethod {
  Momo = 'Momo',
  VNPay = 'VNPay',
  SeaPay = 'SeaPay',
}

export class CreateOrderDto {
  @IsNotEmpty()
  accountId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}