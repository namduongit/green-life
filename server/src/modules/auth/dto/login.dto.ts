import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @IsNotEmpty({ message: 'Không được để trống mật khẩu xác nhận' })
    password: string;
}
