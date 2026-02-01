import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @IsNotEmpty({ message: 'Không được để trống mật khẩu' })
    password: string;

    @IsNotEmpty({ message: 'Không được để trống mật khẩu xác nhận' })
    passwordConfirm: string;
}
