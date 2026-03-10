type PaymentType = 'Momo' | 'VNPay' | 'Sepay';

type PaymentRep = {
    requestId: string | null,
    orderId: string,
    createDate: number | null,
    expireDate: number | null,
    provider: PaymentType,
    transaction: {
        account: {
            id: string,
            email: string
        },
        total: number,
        quantity: number
    },
    payment: {
        paymentUrl: string,
        qrCodeImage?: string
    }
}

export type { PaymentRep }
