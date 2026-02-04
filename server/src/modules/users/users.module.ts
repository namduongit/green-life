import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CommonModule } from '../common.module';
import { AddressesModule } from '../addresses/addresses.module';
import { CartsModule } from '../carts/carts.module';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [CommonModule, AddressesModule, CartsModule],
})
export class UsersModule {}
