import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT ?? 8000;
  console.log("Server is running on port: ", PORT);
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}
bootstrap();
