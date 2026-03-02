import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesController } from './modules/categories/categories.controller';
import { CategoriesModule } from './modules/categories/categories.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { TagsModule } from './modules/tags/tags.module';
import { AccountsModule } from './modules/accounts/accounts.module';

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
        TagsModule,
        CategoriesModule,
        ProductsModule,
        AccountsModule,
        /** Payment */
        PaymentsModule,
    ],
    // Utility providers
    providers: [],
    // Export utility provider (public)
    exports: [],
})
export class AppModule {
    // configure(consumer: MiddlewareConsumer) {
    //     consumer.apply(LoggerMiddleware).forRoutes(CategoriesController);
    // }
}
