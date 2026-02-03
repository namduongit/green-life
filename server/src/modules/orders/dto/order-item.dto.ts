import { IsInt, IsNotEmpty, Min } from "class-validator";

export class OrderItemDto {
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}