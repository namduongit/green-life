import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { CommonModule } from '../common.module';
import { AddressesModule } from '../addresses/addresses.module';
import { CartsModule } from '../carts/carts.module';

@Module({
    controllers: [AccountsController],
    providers: [AccountsService],
    imports: [CommonModule, AddressesModule, CartsModule],
})
export class AccountsModule {}
