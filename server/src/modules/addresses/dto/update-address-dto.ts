import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto {
    @IsOptional()
    @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi' })
    @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
    province?: string;

    @IsOptional()
    @IsString({ message: 'Quận/Huyện phải là chuỗi' })
    @IsNotEmpty({ message: 'Quận/Huyện không được để trống' })
    city?: string;

    @IsOptional()
    @IsString({ message: 'Địa chỉ nhà phải là chuỗi' })
    @IsNotEmpty({ message: 'Địa chỉ nhà không được để trống' })
    home?: string;
}
