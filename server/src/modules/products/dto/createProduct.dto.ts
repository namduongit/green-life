import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CommonStatus, Unit } from 'prisma/generated/enums';

export class ProductTagDto {
    @IsString({ message: 'Tag id phải là chuỗi' })
    @IsNotEmpty({ message: 'Tag id không được để trống' })
    id: string;
}

export class ProductPropertyDto {
    @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
    name: string;

    @IsString({ message: 'URL hình ảnh phải là chuỗi' })
    urlImage: string;

    @IsString({ message: 'Mô tả phải là chuỗi' })
    description: string;

    @IsString({ message: 'Khối lượng phải là chuỗi (ví dụ: 1kg)' })
    weight: string;

    @IsEnum(Unit, { message: 'Đơn vị tính không hợp lệ' })
    unit: Unit;

    @IsNumber({}, { message: 'Chiều dài phải là số' })
    length: number;

    @IsNumber({}, { message: 'Chiều rộng phải là số' })
    width: number;

    @IsNumber({}, { message: 'Chiều cao phải là số' })
    height: number;
}

export class CreateProductDto {
    @IsInt({ message: 'Số lượng tồn kho phải là số nguyên' })
    currentStock: number;

    @IsEnum(CommonStatus, { message: 'Trạng thái không hợp lệ' })
    status: CommonStatus;

    @IsString({ message: 'categoryId phải là chuỗi' })
    @IsNotEmpty({ message: 'categoryId không được để trống' })
    categoryId: string;

    @IsArray({ message: 'Tags phải là một mảng' })
    @ValidateNested({ each: true })
    @Type(() => ProductTagDto)
    tags: ProductTagDto[];

    @ValidateNested({ message: 'Thuộc tính sản phẩm không hợp lệ' })
    @Type(() => ProductPropertyDto)
    property: ProductPropertyDto;

    @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
    price: number;
}
