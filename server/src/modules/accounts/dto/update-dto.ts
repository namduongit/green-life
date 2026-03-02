import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'prisma/generated/client';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password?: string;

    @IsOptional()
    @IsEnum(Role, { message: 'Vai trò không hợp lệ' })
    role?: Role;
}
