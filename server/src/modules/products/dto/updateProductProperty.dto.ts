import { ValidateNested } from 'class-validator';
import { ProductPropertyDto } from './createProduct.dto';
import { Type } from 'class-transformer';

export class UpdateProductPropertyDto {
    @ValidateNested()
    @Type(() => ProductPropertyDto)
    property: ProductPropertyDto;
}
