import { Module } from '@nestjs/common';
import { PrismaService } from './configs/prisma-client.config';
import { TagsModule } from './modules/tags/tags.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [TagsModule, CategoriesModule],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
