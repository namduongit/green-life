


type Item = {
    id: string,
    name: string,
    description: string,
    imageUrl: string,
    price: number,
    quantity: number,
    unit: string,
    totalPrice: number
}
type Items = Item[];

type DeleveryInfo = {
    deliveryAddress: string,
    deliveryFee: string,
    quantity: string
}

type UserInfo = {
    name: string,
    phoneNumber: string,
    email: string
}

export type MomoOptionalOtps = {
    items?: Items,
    deliveryInfo?: DeleveryInfo,
    userInfo?: UserInfo
}

export type MomoRequireOtps = {
    total: number, 
    orderId: string, 
    orderInfo: string,
    lang: "vi" | "en", 
    extraData: {
        id: string,
        email: string
    }
}