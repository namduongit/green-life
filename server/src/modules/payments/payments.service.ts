import { BadRequestException, Injectable } from '@nestjs/common';
import { CryptoUtils } from 'src/utils/crypto.utils';
import { MomoConstants } from 'src/constants/momo.constants';
import { MomoIpnCallBack, MomoOptionalOtps, MomoRequireOtps } from './types/momo/momo.type';
import { PaymentRep } from './dto/payment-response.type';
import { v1 } from "uuid";
import axios from 'axios';
import { OrdersService } from '../orders/orders.service';
import { SepayIpnCallBack, SepayOptionalOpts, SepayRequireOpts } from './types/sepay/sepay.type';
import { MomoCreateRep } from './types/momo/momo.response';
import { SepayConstants } from 'src/constants/sepay.constants';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly cryptoUtils: CryptoUtils,
        private readonly orderService: OrdersService
    ) { }

    async paymentMomoCreate(
        require: MomoRequireOtps,
        optional?: MomoOptionalOtps
    ): Promise<PaymentRep> {
        const order = await this.orderService.getOrderById(require.orderId);
        if (!order) {
            throw new BadRequestException("Đơn hàng không tồn tại");
        }
        if (order.paymentStatus === "Paid") {
            throw new BadRequestException("Đơn hàng đã được thanh toán");
        }

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
            const response = await axios.post<MomoCreateRep>(API_URL, params);
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
            }
            throw new BadRequestException("Lỗi ở phía máy chủ, vui lòng thử lại sau");
        } catch (error: any) {
            console.log("Error when calling Momo Create API: ", error.response.data);
            throw new BadRequestException(error.response.data.message);
        }
    }

    async paymentMomoIpn(ipn: MomoIpnCallBack) {
        console.log("Received IPN from Momo: ", ipn);
        const signature =
            `accessKey=${MomoConstants.AccessKey}` +
            `&amount=${ipn.amount}` +
            `&extraData=${ipn.extraData}` +
            `&message=${ipn.message}` +
            `&orderId=${ipn.orderId}` +
            `&orderInfo=${ipn.orderInfo}` +
            `&orderType=${ipn.orderType}` +
            `&partnerCode=${ipn.partnerCode}` +
            `&payType=${ipn.payType}` +
            `&requestId=${ipn.requestId}` +
            `&responseTime=${ipn.responseTime}` +
            `&resultCode=${ipn.resultCode}` +
            `&transId=${ipn.transId}`;

        const signed = this.cryptoUtils.encryptSignMomo(signature, MomoConstants.SecretKey);
        if (signed === ipn.signature) {
            console.log("IPN signature is valid.");
            // call to order service to update order status
            this.orderService.updateOrderPaymentStatus(ipn.orderId, "Paid");
        }
    }

    async paymentSepayCreate(
        require: SepayRequireOpts,
        optional?: SepayOptionalOpts
    ): Promise<PaymentRep> {
        const order = await this.orderService.getOrderById(require.orderId);
        if (!order) {
            throw new BadRequestException("Đơn hàng không tồn tại");
        }
        if (order.paymentStatus === "Paid") {
            throw new BadRequestException("Đơn hàng đã được thanh toán");
        }

        const requestId = v1();

        const paymentUrl = SepayConstants.Endpoint.replace("$AMOUNT", require.total.toString()).replace("$ORDER_ID", require.orderId);

        return {
            requestId: requestId,
            orderId: require.orderId,
            createDate: Date.now(),
            expireDate: null,
            provider: 'Sepay',
            transaction: {
                account: {
                    id: require.customer.id,
                    email: require.customer.email
                },
                total: require.total,
                quantity: 0
            },
            payment: {
                paymentUrl: paymentUrl
            }
        }
    }

    async paymentSepayIpn(authorizationKey: string, ipn: SepayIpnCallBack) {
        if (authorizationKey !== SepayConstants.ApiKey) {
            throw new BadRequestException("Unauthorized");
        }
    
    }
}
