export type MomoIPNRequest = {
    orderType: string,
    amount: number,
    partnerCode: string,
    orderId: string,
    extraData: string,
    signature: string,
    transId: string,
    responseTime: string,
    resultCode: string,
    message: string,
    payType: string,
    requestId: string,
    orderInfo: string
}