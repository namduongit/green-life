import { Injectable } from '@nestjs/common';
import QueryString from 'qs';

@Injectable()
export class PaymentUtils {
    public formatDate(type: 'YYYYMMDDHHmmss' | 'ssmmHHDDMMYYYY', date?: Date): string {
        if (!date) date = new Date();
        switch (type) {
            case 'YYYYMMDDHHmmss':
                return (
                    String(date.getFullYear()).padStart(4, '0') +
                    String(date.getMonth() + 1).padStart(2, '0') +
                    String(date.getDate()).padStart(2, '0') +
                    String(date.getHours()).padStart(2, '0') +
                    String(date.getMinutes()).padStart(2, '0') +
                    String(date.getSeconds()).padStart(2, '0')
                );
            case 'ssmmHHDDMMYYYY':
                return '';

            default:
                throw new Error('Type Format Not Valid');
        }
    }

    public sortObject(obj: Record<string, any>): Record<string, string> {
        const sorted: Record<string, string> = {};
        const encodedKeys: string[] = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                encodedKeys.push(encodeURIComponent(key));
            }
        }

        encodedKeys.sort();

        for (let i = 0; i < encodedKeys.length; i++) {
            sorted[encodedKeys[i]] = encodeURIComponent(obj[encodedKeys[i]]).replace(/%20/g, '+');
        }

        return sorted;
    }
}
