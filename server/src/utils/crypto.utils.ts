import { Injectable } from "@nestjs/common";
import { createHash, createHmac } from "crypto";

@Injectable()
export class CryptoUtils {
    public encryptSignVnpay(signature: string, secretKey: string) {
        const hmac = createHmac("sha512", secretKey);
        const signed = hmac.update(new Buffer(signature, 'utf-8')).digest("hex");
        return signed;
    }

    public encryptSignMomo(signature: string, secretKey: string): string {
        const hmac = createHmac('sha256', secretKey);
        const signed = hmac.update(signature).digest('hex');
        return signed;
    }
}