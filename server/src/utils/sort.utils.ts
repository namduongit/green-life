import { Injectable } from "@nestjs/common";

@Injectable()
export class SortUtils {
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
            sorted[encodedKeys[i]] = encodeURIComponent(obj[encodedKeys[i]]).replace(/%20/g, "+");
        }

        return sorted;
    }
}