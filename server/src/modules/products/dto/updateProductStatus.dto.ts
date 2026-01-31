import { IsEnum } from 'class-validator';
import { ProductStatus, type ProductStatusType } from '../entities/products.entitie';

export class UpdateProductStatusDto {
    @IsEnum(ProductStatus)
    readonly status: ProductStatusType;
}
