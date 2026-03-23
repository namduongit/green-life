import {
  IsEnum,
} from 'class-validator';
import { OrderPaymentMethod } from 'prisma/generated/enums';

export class CreateOrderDto {
  recipientName: string;
  recipientPhone: string;
  recipientProvince: string;
  recipientWard: string;
  recipientDetail: string;

  orderItem: OrderItemDto[];

  @IsEnum(OrderPaymentMethod)
  paymentMethod: OrderPaymentMethod;
}

class OrderItemDto {
  productId: string;
  quantity: number;
}