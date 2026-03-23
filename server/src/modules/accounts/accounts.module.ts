import { Module } from '@nestjs/common';
import { AccountsService } from './services/accounts.service';
import { AccountsController } from './controllers/accounts.controller';
import { CommonModule } from '../common.module';
import { AddressesModule } from '../addresses/addresses.module';
import { CartsModule } from '../carts/carts.module';

@Module({
    controllers: [AccountsController],
    providers: [AccountsService],
    imports: [CommonModule, AddressesModule, CartsModule],
})
export class AccountsModule {}
