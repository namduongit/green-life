import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { PrismaService } from "src/configs/prisma-client.config";
import { BcryptUtils } from "src/utils/bcrypt.utils";
import { AuthService } from "./auth.service";
import { JsonWtConstants } from "src/constants/jsonwt.constants";
import { CommonModule } from "../common.module";

@Module({
    imports: [JwtModule.register({
        global: true,
        secret: JsonWtConstants.secret,
        signOptions: {
            expiresIn: JsonWtConstants.expiresIn
        }
    }), CommonModule],
    controllers: [AuthController],
    providers: [
        BcryptUtils, AuthService
    ]
})
export class AuthModule {}