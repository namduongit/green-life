import { IsArray, IsEnum, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { ProductStatus, type ProductStatusType, ProductUnit, type ProductUnitType } from '../entities/products.entitie';
import { Type } from 'class-transformer';

export class ProductPropertyDto {
    @IsString()
    name: string;
    @IsString()
    urlImage: string;
    @IsString()
    description: string;
    @IsString()
    weight: string;
    @IsEnum(ProductUnit)
    unit: ProductUnitType;
    @IsNumber()
    length: number;
    @IsNumber()
    width: number;
    @IsNumber()
    height: number;
}

export class CreateProductDto {
    @IsNumber()
    currentStock: number;
    @IsEnum(ProductStatus)
    status: ProductStatusType;

    @IsString()
    categoryId: string;

    @IsArray()
    tags: {
        id: string;
    }[];

    @ValidateNested()
    @IsObject()
    @Type(() => ProductPropertyDto)
    property: ProductPropertyDto;
}
