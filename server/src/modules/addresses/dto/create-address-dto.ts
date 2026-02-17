import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAddressDto {
    @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi' })
    @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
    province: string;

    @IsString({ message: 'Quận/Huyện phải là chuỗi' })
    @IsNotEmpty({ message: 'Quận/Huyện không được để trống' })
    city: string;

    @IsString({ message: 'Địa chỉ nhà phải là chuỗi' })
    @IsNotEmpty({ message: 'Địa chỉ nhà không được để trống' })
    home: string;
}
