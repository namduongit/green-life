import { Module } from '@nestjs/common';
import { CommonModule } from '../common.module';
import { AddressesService } from './services/addresses.service';

@Module({
    imports: [CommonModule],
    providers: [AddressesService],
    exports: [AddressesService],
})
export class AddressesModule {}
