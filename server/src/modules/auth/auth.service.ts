import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/configs/prisma-client.config';
import { JsonWtConstants } from 'src/constants/jsonwt.constants';
import { BcryptUtils } from 'src/utils/bcrypt.utils';
import { LoginRep, RegisterRep } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly bcryptUtil: BcryptUtils,
        private readonly prismaService: PrismaService,
    ) {}

    async register(registerDto: RegisterDto): Promise<RegisterRep> {
        const existingAccount = await this.prismaService.prismaClient.accounts.findFirst({
            where: {
                email: registerDto.email,
            },
        });

        if (existingAccount) throw new BadRequestException('Tài khoản đã tồn tại');
        console.log(registerDto);
        if (registerDto.password !== registerDto.passwordConfirm)
            throw new BadRequestException('Mật khẩu xác nhận không khớp');

        const hashedPassword = await this.bcryptUtil.hashPassword(registerDto.password);
        const newAccount = await this.prismaService.prismaClient.accounts.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                cart: {
                    create: {},
                }
            },
        });

        return {
            uid: newAccount.id,
            email: newAccount.email,
        };
    }

    async login(loginDto: LoginDto): Promise<LoginRep> {
        const account = await this.prismaService.prismaClient.accounts.findUnique({
            where: { email: loginDto.email },
        });

        if (!account) throw new NotFoundException('Tài khoản không tồn tại');
        const isComparePassword = await this.bcryptUtil.comparePassword(loginDto.password, account.password);
        if (!isComparePassword) throw new UnauthorizedException('Mật khẩu không chính xác');

        const issuedAt = Math.floor(Date.now() / 1000);
        const expiresAt = issuedAt + JsonWtConstants.expiresIn;
        const token = this.jwtService.sign({
            sub: {
                uid: account.id,
                email: account.email,
                joinTime: account.createdAt,
                isLock: account.isLock,
            },
            role: account.role,
        });

        return {
            uid: account.id,
            email: account.email,
            accessToken: token,
            time: {
                issuedAt: issuedAt,
                expiresAt: expiresAt,
            },
        };
    }

    async validate() {}
}
