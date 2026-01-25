import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

@Catch()
export class LogExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        console.log("Log exception: ",exception)
    }
    
}