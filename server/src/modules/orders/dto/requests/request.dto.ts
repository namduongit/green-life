import {
  IsEnum,
  IsNotEmpty
} from 'class-validator';
import { OrderPaymentMethod } from 'prisma/generated/enums';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  recipientName!: string;
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  recipientPhone!: string;
  @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
  recipientProvince!: string;
  @IsNotEmpty({ message: 'Phường/Xã không được để trống' })
  recipientWard!: string;
  @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
  recipientDetail!: string;

  @IsNotEmpty({ message: 'Đơn hàng phải có ít nhất một sản phẩm' })
  orderItem!: OrderItemDto[];

  @IsEnum(OrderPaymentMethod)
  paymentMethod!: OrderPaymentMethod;
}

class OrderItemDto {
  productId!: string;
  quantity!: number;
}