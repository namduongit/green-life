import { IsNumber } from 'class-validator';

export class UpdateProductStockDto {
    @IsNumber()
    readonly stock: number;
}
