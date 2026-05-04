import { BadRequestException, Injectable } from '@nestjs/common';
import { CryptoUtils } from 'src/utils/crypto.utils';
import { MomoConstants } from 'src/constants/momo.constants';
import { PaymentRep } from '../dto/responses/response.dto';
import { v1 } from "uuid";
import axios from 'axios';
import { AxiosError } from 'axios';
import { MomoOptionalOtps, MomoRequireOtps } from '../dto/requests/momo-request.dto';
import { MomoCreateResponseDto } from '../dto/responses/momo-response.dto';
import { PrismaService } from 'src/configs/prisma-client.config';
import { OrderPaymentStatus } from 'prisma/generated/enums';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly cryptoUtils: CryptoUtils,
        private readonly prismaService: PrismaService,
    ) { }

    async paymentMomoCreate(
        require: MomoRequireOtps,
        optional?: MomoOptionalOtps
    ): Promise<PaymentRep> {
        const requestId = v1();
        const extraData = Buffer.from(JSON.stringify(require.extraData)).toString('base64');

        const signature =
            `accessKey=${MomoConstants.AccessKey}` +
            `&amount=${require.total}` +
            `&extraData=${extraData}` +
            `&ipnUrl=${MomoConstants.IpnUrl}` +
            `&orderId=${require.orderId}` +
            `&orderInfo=${require.orderInfo}` +
            `&partnerCode=${MomoConstants.PartnerCode}` +
            `&redirectUrl=${MomoConstants.RedirectUrl}` +
            `&requestId=${requestId}` +
            `&requestType=captureWallet`;

        const signed = this.cryptoUtils.encryptSignMomo(signature, MomoConstants.SecretKey);

        const params: any = {
            partnerCode: MomoConstants.PartnerCode,
            requestType: "captureWallet",
            ipnUrl: MomoConstants.IpnUrl,
            redirectUrl: MomoConstants.RedirectUrl,
            orderId: require.orderId,
            amount: require.total,
            orderInfo: require.orderInfo,
            requestId: requestId,
            extraData: extraData,
            signature: signed,
            lang: require.lang
        }

        if (optional?.items) {
            params.items = optional.items;
        }
        if (optional?.deliveryInfo) {
            params.deliveryInfo = optional.deliveryInfo;
        }
        if (optional?.userInfo) {
            params.userInfo = optional.userInfo;
        }


        const API_URL = MomoConstants.Enpoint + "/" + "create";
        try {
            const response = await axios.post<MomoCreateResponseDto>(API_URL, params);

            console.log(response.data);
            if (response.data) {
                if (response.data.resultCode === 0) {
                    return {
                        requestId: requestId,
                        orderId: require.orderId,
                        createDate: null,
                        expireDate: null,
                        provider: "Momo",
                        transaction: {
                            account: {
                                id: require.extraData.id,
                                email: require.extraData.email
                            },
                            quantity: 0,
                            total: require.total
                        },
                        payment: {
                            paymentUrl: response.data.payUrl ?? ""
                        }
                    }
                }
                throw new BadRequestException(response.data.message);
            } else {
                throw new BadRequestException("Lỗi ở phía máy chủ, vui lòng thử lại sau");
            }
        } catch (error: any) {
            console.log("hehee");
            if (error instanceof AxiosError) {
                console.log(error.response?.data.message)
                if (error.response) {
                    throw new BadRequestException(error.response.data.message);

                }
            }
            console.log("Error in Momo gateway: ", error);
            throw new BadRequestException("Lỗi không xác định, vui lòng thử lại sau");
        }
    }

    /**
     * Xử lý IPN callback từ Momo sau khi người dùng thanh toán
     * resultCode = 0 → thanh toán thành công
     */
    async handleMomoIpn(body: any): Promise<void> {
        const { orderId, resultCode, requestId, amount, transId } = body;

        console.log(`[Momo IPN] orderId=${orderId}, resultCode=${resultCode}, transId=${transId}`);

        if (!orderId) {
            console.warn('[Momo IPN] Missing orderId in callback');
            return;
        }

        const order = await this.prismaService.prismaClient.orders.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            console.warn(`[Momo IPN] Order ${orderId} not found`);
            return;
        }

        if (resultCode === 0) {
            // Thanh toán thành công → cập nhật paymentStatus và tạo checkoutHistory
            await this.prismaService.prismaClient.$transaction(async (prisma) => {
                await prisma.orders.update({
                    where: { id: orderId },
                    data: { paymentStatus: OrderPaymentStatus.Paid },
                });

                // Tạo checkoutHistory nếu chưa có
                const existing = await prisma.checkoutHistory.findUnique({
                    where: { orderId },
                });

                if (!existing) {
                    await prisma.checkoutHistory.create({
                        data: {
                            orderId,
                            accountId: order.accountId,
                            paymentType: 'Momo' as any,
                            amount: amount ?? order.totalAmount,
                            requestId: requestId ?? '',
                        },
                    });
                }
            });

            console.log(`[Momo IPN] Order ${orderId} marked as Paid`);
        } else {
            console.log(`[Momo IPN] Payment failed for order ${orderId}, resultCode=${resultCode}`);
        }
    }

    async paymentMomoQuery() {

    }

    async paymentMomoConfirm() {

    }

    async paymentMomoRefund() {

    }

    /** */
    async paymentSeapayCreate() {

    }

    /** Admin: lấy tất cả giao dịch với filter/sort/pagination */
    async getAllTransactions(params: {
        page: number;
        limit: number;
        paymentType?: string;
        sortBy?: 'amount' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
        search?: string;
    }) {
        const { page, limit, paymentType, sortBy = 'createdAt', sortOrder = 'desc', search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (paymentType) where.paymentType = paymentType;
        if (search) {
            where.OR = [
                { requestId: { contains: search, mode: 'insensitive' } },
                { account: { email: { contains: search, mode: 'insensitive' } } },
                { orderId: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [total, data] = await Promise.all([
            this.prismaService.prismaClient.checkoutHistory.count({ where }),
            this.prismaService.prismaClient.checkoutHistory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    account: { select: { id: true, email: true } },
                    order: {
                        select: {
                            id: true,
                            status: true,
                            paymentMethod: true,
                            paymentStatus: true,
                            totalAmount: true,
                            recipientName: true,
                        },
                    },
                },
            }),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
