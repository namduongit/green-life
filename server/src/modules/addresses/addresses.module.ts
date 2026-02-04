import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CommonModule } from '../common.module';

@Module({
    providers: [AddressesService],
    imports: [CommonModule],
    exports: [AddressesService],
})
export class AddressesModule {}
