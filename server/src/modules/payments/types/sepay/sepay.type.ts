export type SepayOptionalOpts = {

}

export type SepayRequireOpts = {
    total: number,
    orderId: string,
    customer: {
        id: string,
        email: string   
    }
}

export type SepayIpnCallBack = {
    gateway: string,
    accountNumber: string,
    subAccount: string,
    code: string | null,
    content: string,
    transferType: string,
    description: string,
    transferAmount: number,
    referenceCode: string,
    accumulated: number,
    id: number
}