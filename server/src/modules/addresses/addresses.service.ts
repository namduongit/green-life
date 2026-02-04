import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CreateAddressDto } from './dto/create-address-dto';
import { UpdateAddressDto } from './dto/update-address-dto';

@Injectable()
export class AddressesService {
    constructor(private readonly prismaService: PrismaService) {}
    async getAddress(id: string) {
        const addresses = await this.prismaService.prismaClient.addresses.findMany({
            where: {
                accountId: id,
            },
        });

        return addresses;
    }

    async addAddress(id: string, data: CreateAddressDto) {
        const newAddress = await this.prismaService.prismaClient.addresses.create({
            data: {
                accountId: id,
                province: data.province,
                city: data.city,
                home: data.home,
            },
        });

        return newAddress;
    }

    async updateAddress(id: string, addressId: string, data: UpdateAddressDto) {
        const updatedAddress = await this.prismaService.prismaClient.addresses.updateMany({
            where: {
                id: addressId,
                accountId: id,
            },
            data: {
                province: data.province,
                city: data.city,
                home: data.home,
            },
        });

        return updatedAddress;
    }

    async deleteAddress(id: string, addressId: string) {
        const deletedAddress = await this.prismaService.prismaClient.addresses.deleteMany({
            where: {
                id: addressId,
                accountId: id,
            },
        });

        return deletedAddress;
    }
}
