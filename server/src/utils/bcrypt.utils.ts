import { Injectable, InternalServerErrorException } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class BcryptUtils {
    private saltRound;
    constructor() {
        this.saltRound = Number(process.env.SALT_ROUND) || 10;
    }

    /**
     * Hash a plain text password
     * @param password - Plain text password
     * @returns Promise<string> - Hashed password
     */
    public async hashPassword(password: string) {
        try {
            const salt = await bcrypt.genSalt(this.saltRound);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error: any) {
            console.log('Bcrypt: Fail to hash password - error: ', error);
            throw new InternalServerErrorException();
        }
    }

    public async comparePassword(plainPassword: string, hashedPassword: string) {
        try {
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            return isMatch;
        } catch (error: any) {
            console.log('Bcrypt: Fail to compare password - error: ', error);
            throw new InternalServerErrorException();
        }
    }
}
