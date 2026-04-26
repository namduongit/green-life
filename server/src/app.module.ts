import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { TagsModule } from './modules/tags/tags.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthorizeMiddleware } from './middleware/authorize.middleware';
import { JwtModule } from '@nestjs/jwt';
import { JsonWtConstants } from './constants/jsonwt.constants';
import { OrdersModule } from './modules/orders/orders.module';
import { ScheduleModule } from '@nestjs/schedule';

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
        JwtModule.register({
            global: true,
            secret: JsonWtConstants.secret,
            signOptions: {
                expiresIn: JsonWtConstants.expiresIn,
            },
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        TagsModule,
        CategoriesModule,
        ProductsModule,
        AccountsModule,
        OrdersModule,
        /** Payment */
        PaymentsModule,
    ],
    // Utility providers
    providers: [],
    // Export utility provider (public)
    exports: [],
})
export class AppModule implements NestModule {
    // configure(consumer: MiddlewareConsumer) {
    //     consumer.apply(LoggerMiddleware).forRoutes(CategoriesController);
    // }
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
        consumer.apply(AuthorizeMiddleware).forRoutes('/api/users/:id/cart');
        consumer.apply(AuthorizeMiddleware).forRoutes('/api/users/:id/orders');
        consumer.apply(AuthorizeMiddleware).forRoutes('/api/orders');
    }
}
