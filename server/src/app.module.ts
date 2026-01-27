import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaService } from './configs/prisma-client.config';
import { TagsModule } from './modules/tags/tags.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { CategoriesController } from './modules/categories/categories.controller';
import { AuthModule } from './modules/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { ProductsModule } from './products/products.module';

/**
 * Explain:
 * 
 * - providers: import another servicer, this can be inject in class
 * - exports: aplly export providers in module
 * 
 * @Architure
 * App - Provider: PrismaService, JwtService
 * -> AuthModule, TagsModule,... can use provider
 */

@Module({
  imports: [
    AuthModule,
    TagsModule, CategoriesModule, ProductsModule
  ],
  // Utility providers
  providers: [

  ],
  // Export utility provider (public)
  exports: [

  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CategoriesController);
  }
  
}
