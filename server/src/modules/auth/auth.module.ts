import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { BcryptUtils } from 'src/utils/bcrypt.utils';
import { AuthService } from './services/auth.service';
import { CommonModule } from '../common.module';
@Module({
    imports: [CommonModule],
    controllers: [AuthController],
    providers: [BcryptUtils, AuthService]
})
export class AuthModule {}
