import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'prisma/generated/enums';

import { Prisma } from 'prisma/generated/browser';
import { FilterKey, PrismaQueryPipeline } from 'src/utils/filter.utils';


export class CreateAccountDto {
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;

    @IsEnum(Role, { message: 'Vai trò không hợp lệ' })
    role: Role;
}

export class QueryAccountDto extends PrismaQueryPipeline<
    Prisma.AccountsWhereInput,
    Prisma.AccountsOrderByWithRelationInput
> {
    getAllowedFilterKeys(): ('pageSize' | FilterKey<Prisma.AccountsWhereInput, 3>)[] {
        return ['page', 'pageSize'];
    }
}

export class UpdateAccountDto {
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
