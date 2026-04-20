import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
    @IsString({ message: 'Họ tên phải là chuỗi' })
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    fullName!: string;

    @IsString({ message: 'Số điện thoại phải là chuỗi' })
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    phone!: string;

    @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi' })
    @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
    province!: string;

    @IsString({ message: 'Phường/Xã phải là chuỗi' })
    @IsNotEmpty({ message: 'Phường/Xã không được để trống' })
    ward!: string;

    @IsString({ message: 'Địa chỉ cụ thể phải là chuỗi' })
    @IsNotEmpty({ message: 'Địa chỉ cụ thể không được để trống' })
    detail!: string;

    @IsOptional()
    @IsBoolean({ message: 'Mặc định phải là kiểu boolean' })
    isDefault?: boolean;
}

export class UpdateAddressDto {
    @IsOptional()
    @IsString({ message: 'Họ tên phải là chuỗi' })
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    fullName?: string;

    @IsOptional()
    @IsString({ message: 'Số điện thoại phải là chuỗi' })
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    phone?: string;

    @IsOptional()
    @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi' })
    @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
    province?: string;

    @IsOptional()
    @IsString({ message: 'Phường/Xã phải là chuỗi' })
    @IsNotEmpty({ message: 'Phường/Xã không được để trống' })
    ward?: string;

    @IsOptional()
    @IsString({ message: 'Địa chỉ cụ thể phải là chuỗi' })
    @IsNotEmpty({ message: 'Địa chỉ cụ thể không được để trống' })
    detail?: string;

    @IsOptional()
    @IsBoolean({ message: 'Mặc định phải là kiểu boolean' })
    isDefault?: boolean;
}
