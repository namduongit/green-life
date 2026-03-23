import { Module } from '@nestjs/common';
import { AddressesService } from './services/addresses.service';
import { CommonModule } from '../common.module';

@Module({
    providers: [AddressesService],
    imports: [CommonModule],
    exports: [AddressesService],
})
export class AddressesModule {}
