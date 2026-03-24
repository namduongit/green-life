import { Module } from '@nestjs/common';
import { AddressesModule } from '../addresses/addresses.module';
import { CartsModule } from '../carts/carts.module';
import { CommonModule } from '../common.module';
import { AccountsController } from './controllers/accounts.controller';
import { AccountsService } from './services/accounts.service';

@Module({
    imports: [CommonModule, AddressesModule, CartsModule],
    controllers: [AccountsController],
    providers: [AccountsService],
    exports: [AccountsService],
})
export class AccountsModule {}
