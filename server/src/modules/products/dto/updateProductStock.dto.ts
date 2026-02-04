import { IsNumber } from 'class-validator';

export class UpdateProductStockDto {
    @IsNumber(
        {
            allowNaN: false,
            allowInfinity: false,
        },
        {
            message: 'Số lượng tồn kho phải là một số hợp lệ',
        },
    )
    readonly stock: number;
}
