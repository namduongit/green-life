import { BadRequestException, Injectable } from '@nestjs/common';
import { CryptoUtils } from 'src/utils/crypto.utils';
import { MomoConstants } from 'src/constants/momo.constants';
import { MomoOptionalOtps, MomoRequireOtps } from './types/momo/momo.type';
import { PaymentRep } from './dto/payment-response.type';
import { v1 } from "uuid";
import axios from 'axios';
import { MomoCreateRep } from './types/momo/momo.response';
import { AxiosError } from 'axios';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly cryptoUtils: CryptoUtils,
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

    async paymentMomoQuery() {

    }

    async paymentMomoConfirm() {

    }

    async paymentMomoRefund() {

    }

    /** */
    async paymentSeapayCreate() {

    }
}
