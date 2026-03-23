import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CreateAddressDto } from '../dto/requests/create-address-dto';
import { UpdateAddressDto } from '../dto/requests/update-address-dto';

@Injectable()
export class AddressesService {
    constructor(private readonly prismaService: PrismaService) {}

    async getAddresses(accountId: string) {
        return this.prismaService.prismaClient.addresses.findMany({
            where: { accountId },
            orderBy: { isDefault: 'desc' },
        });
    }

    async getAddressById(accountId: string, addressId: string) {
        return this.ensureAddress(accountId, addressId);
    }

    async createAddress(accountId: string, data: CreateAddressDto) {
        const { fullName, phone, province, ward, detail, isDefault } = data;

        return this.prismaService.prismaClient.$transaction(async (prisma) => {
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
    }

    async updateAddress(accountId: string, addressId: string, data: UpdateAddressDto) {
        await this.ensureAddress(accountId, addressId);
        const payload = this.buildAddressPayload(data);

        if (data.isDefault !== undefined) {
            payload.isDefault = data.isDefault;
        }

        if (Object.keys(payload).length === 0) {
            return this.getAddressById(accountId, addressId);
        }

        return this.prismaService.prismaClient.$transaction(async (prisma) => {
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
    }

    async deleteAddress(accountId: string, addressId: string) {
        await this.ensureAddress(accountId, addressId);
        return this.prismaService.prismaClient.addresses.delete({
            where: { id: addressId },
        });
    }

    private async ensureAddress(accountId: string, addressId: string) {
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

    private buildAddressPayload(data: Partial<CreateAddressDto>) {
        const payload: Record<string, string | boolean> = {};
        const { fullName, phone, province, ward, detail } = data;

        if (fullName !== undefined) payload.fullName = fullName;
        if (phone !== undefined) payload.phone = phone;
        if (province !== undefined) payload.province = province;
        if (ward !== undefined) payload.ward = ward;
        if (detail !== undefined) payload.detail = detail;

        return payload;
    }
}
