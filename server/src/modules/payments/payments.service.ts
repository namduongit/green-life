import { Injectable } from '@nestjs/common';
import { PaymentRep } from './dto/payment-response.type';
import { PaymentType } from 'prisma/generated/enums';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VNPayConstants } from 'src/constants/vnpay.constants';
import { Request } from 'express';
import { PaymentUtils } from 'src/utils/payment.utils';
import { encode, stringify } from 'querystring';
import { CryptoUtils } from 'src/utils/crypto.utils';
import { MomoConstants } from 'src/constants/momo.constants';
import QueryString from 'qs';

import { createHash } from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly paymentUtils: PaymentUtils,
        private readonly cryptoUtils: CryptoUtils,
    ) {}

    /** Call get QR/Link checkout */
    async getCheckout(req: Request, type: PaymentType, body: CreatePaymentDto): Promise<PaymentRep> {
        return {};
    }

    async callVnpay(ipAdress: string, createPaymentDto: CreatePaymentDto) {
        const terminalId = VNPayConstants.terminalId;
        const secretKey = VNPayConstants.secretKey;
        const vnpUrl = VNPayConstants.vnpUrl;
        const returnUrl = VNPayConstants.returnUrl;

        // REF -> ID in merchant. Not duplicate in day
        const orderId = Date.now();

        // Optional
        const bankCode = '';

        const locale = 'vn';
        const currCode = 'VND';

        let vnp_Params: Record<string, any> = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = terminalId;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'VNPAY-DH:' + createPaymentDto.id;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = createPaymentDto.totalAmount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = this.paymentUtils.formatDate('YYYYMMDDHHmmss');
        vnp_Params = this.paymentUtils.sortObject(vnp_Params);

        const signature = QueryString.stringify(vnp_Params, { encode: false });
        const signed = this.cryptoUtils.encryptSignVnpay(signature, secretKey);
        vnp_Params['vnp_SecureHash'] = signed;

        const redirectUrl = vnpUrl + '?' + QueryString.stringify(vnp_Params, { encode: false });
        console.log(redirectUrl);
    }

    async callMomo(createPaymentDto: CreatePaymentDto) {
        const enpoint = MomoConstants.momoEnpoint;
        const accessKey = MomoConstants.momoAccessKey;
        const partnerCode = MomoConstants.momoPartnerCode;
        const secretKey = MomoConstants.momoSecretKey;

        const returnUrl = MomoConstants.momoReturnUrl;
        const ipnUrl = MomoConstants.momoIpnUrl;

        const orderId = createPaymentDto.id;

        let momo_Params: any = {};
        momo_Params['partnerCode'] = partnerCode;
        momo_Params['orderId'] = orderId;

        // Idempotency: store REF: order - payment: transaction
        const requestId = Date.now();
        momo_Params['requestId'] = requestId;
        momo_Params['amount'] = createPaymentDto.totalAmount;
        momo_Params['orderInfo'] = 'MOMO-DH:' + createPaymentDto.id;
        momo_Params['redirectUrl'] = returnUrl;
        momo_Params['ipnUrl'] = ipnUrl;
        momo_Params['requestType'] = 'captureWallet';
        momo_Params['extraData'] = '';

        const hashData: Record<string, any> = {
            accessKey: accessKey,
            amount: createPaymentDto.totalAmount,
            extraData: '',
            ipnUrl: ipnUrl,
            orderId: orderId,
            orderInfo: 'MOMO-DH:' + createPaymentDto.id,
            partnerCode: partnerCode,
            redirectUrl: returnUrl,
            requestId: requestId,
            requestType: 'captureWallet',
        };
        const signature = QueryString.stringify(hashData, { encode: false });
        const signed = this.cryptoUtils.encryptSignMomo(signature, secretKey);
        momo_Params['signature'] = signed;

        console.log(QueryString.stringify(momo_Params, { encode: false }));
        try {
            const response = await axios.post(`${enpoint}/create`, momo_Params);
            console.log(response.data);
        } catch (error: any) {
            console.log('Error: ', error);
        }
    }
}
