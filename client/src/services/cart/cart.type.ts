export type CartRep = {
    id: any,
    product: {
        id: any,
        urlImage: string,
        name: string,
        price: number,
    },
    quantity: number
}