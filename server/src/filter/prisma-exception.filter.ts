import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { PrismaClientKnownRequestError } from "prisma/generated/internal/prismaNamespace";
import { RestResponse } from "src/utils/response.utils";

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        console.log("Error in prisma: ", exception);
        const response = host.switchToHttp().getResponse<Response>();
        response
            .status(HttpStatus.BAD_REQUEST)
            .json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Bad Request",
                error: "Dữ liệu truyền vào không hợp lệ",
                data: null
            } as RestResponse<null>);
    }
}