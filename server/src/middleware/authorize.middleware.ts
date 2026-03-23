import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtType } from "src/modules/auth/types/jwt-type";

@Injectable()
export class AuthorizeMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService) { }
    use(req: any, res: any, next: (error?: any) => void) {
        console.log("Run in authorize middlware");
        const header = req.headers["authorization"];
        const token = header && header.split(" ")[1];
        if (!token) {
            throw new UnauthorizedException("Token không tồn tại");
        }
        try {
            const decoded = this.jwtService.verify(token) as JwtType;
            req.user = decoded;
            console.log(decoded)
        } catch (error) {
            console.log("JWT ERROR:", error.message);
            throw new UnauthorizedException("Token không hợp lệ");
        }
        next();
    }
}