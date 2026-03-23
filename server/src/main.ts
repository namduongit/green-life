import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { LogExceptionFilter } from './filter/log-exception.filter';
import { PrismaExceptionFilter } from './filter/prisma-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

async function bootstrap() {
    const PORT = process.env.PORT ?? 8000;
    console.log('Server is running on port: ', PORT);
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: 'http://localhost:5173',
        },
    });

    /**
     * @Architecture
     *
     * Client ---> Filter ---> Pipe ---> Route Handling
     */
    app.useGlobalFilters(new LogExceptionFilter());
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen(PORT);
}
bootstrap();
