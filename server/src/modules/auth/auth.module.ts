import { Module } from '@nestjs/common';
import { BcryptUtils } from 'src/utils/bcrypt.utils';
import { CommonModule } from '../common.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
    imports: [CommonModule],
    controllers: [AuthController],
    providers: [BcryptUtils, AuthService],
    exports: [AuthService],
})
export class AuthModule {}
