import { Injectable, NotFoundException } from '@nestjs/common';
import { Addresses } from 'prisma/generated/client';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CreateAddressDto, UpdateAddressDto } from '../dto/requests/request.dto';
import { AddressResponseDto } from '../dto/responses/address-response.dto';

@Injectable()
export class AddressesService {
    constructor(private readonly prismaService: PrismaService) {}

    async getAddresses(accountId: string): Promise<AddressResponseDto[]> {
        const addresses = await this.prismaService.prismaClient.addresses.findMany({
            where: { accountId },
            orderBy: { isDefault: 'desc' },
        });

        return addresses.map((address) => this.toAddressResponse(address));
    }

    async getAddressById(accountId: string, addressId: string): Promise<AddressResponseDto> {
        const address = await this.ensureAddress(accountId, addressId);
        return this.toAddressResponse(address);
    }

    async createAddress(accountId: string, data: CreateAddressDto): Promise<AddressResponseDto> {
        const { fullName, phone, province, ward, detail, isDefault } = data;

        const createdAddress = await this.prismaService.prismaClient.$transaction(async (prisma) => {
            if (isDefault) {
                await prisma.addresses.updateMany({
                    where: { accountId },
                    data: { isDefault: false },
                });
            }

            return prisma.addresses.create({
                data: {
                    accountId,
                    fullName,
                    phone,
                    province,
                    ward,
                    detail,
                    isDefault: isDefault ?? false,
                },
            });
        });

        return this.toAddressResponse(createdAddress);
    }

    async updateAddress(accountId: string, addressId: string, data: UpdateAddressDto): Promise<AddressResponseDto> {
        await this.ensureAddress(accountId, addressId);
        const payload = this.buildAddressPayload(data);

        if (data.isDefault !== undefined) {
            payload.isDefault = data.isDefault;
        }

        if (Object.keys(payload).length === 0) {
            return this.getAddressById(accountId, addressId);
        }

        const updatedAddress = await this.prismaService.prismaClient.$transaction(async (prisma) => {
            if (data.isDefault) {
                await prisma.addresses.updateMany({
                    where: { accountId },
                    data: { isDefault: false },
                });
            }

            return prisma.addresses.update({
                where: { id: addressId },
                data: payload,
            });
        });

        return this.toAddressResponse(updatedAddress);
    }

    async deleteAddress(accountId: string, addressId: string): Promise<AddressResponseDto> {
        await this.ensureAddress(accountId, addressId);
        const deletedAddress = await this.prismaService.prismaClient.addresses.delete({
            where: { id: addressId },
        });

        return this.toAddressResponse(deletedAddress);
    }

    private async ensureAddress(accountId: string, addressId: string): Promise<Addresses> {
        const address = await this.prismaService.prismaClient.addresses.findFirst({
            where: {
                id: addressId,
                accountId,
            },
        });

        if (!address) {
            throw new NotFoundException('Địa chỉ không tồn tại hoặc không thuộc tài khoản này');
        }

        return address;
    }

    private buildAddressPayload(data: Partial<CreateAddressDto>): Partial<CreateAddressDto> {
        const payload: Partial<CreateAddressDto> = {};
        const { fullName, phone, province, ward, detail } = data;

        if (fullName !== undefined) payload.fullName = fullName;
        if (phone !== undefined) payload.phone = phone;
        if (province !== undefined) payload.province = province;
        if (ward !== undefined) payload.ward = ward;
        if (detail !== undefined) payload.detail = detail;

        return payload;
    }

    private toAddressResponse(address: Addresses): AddressResponseDto {
        return {
            id: address.id,
            accountId: address.accountId,
            fullName: address.fullName,
            phone: address.phone,
            province: address.province,
            ward: address.ward,
            detail: address.detail,
            isDefault: address.isDefault,
        };
    }
}
