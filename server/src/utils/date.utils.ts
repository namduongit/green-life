import { Injectable } from "@nestjs/common";

@Injectable()
export class DateUtils {
    public formatCreateDateVNPay(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, "0");

        return date.getFullYear().toString() +
            pad(date.getMonth() + 1) +
            pad(date.getDate()) +
            pad(date.getHours()) +
            pad(date.getMinutes()) +
            pad(date.getSeconds());
    }
}