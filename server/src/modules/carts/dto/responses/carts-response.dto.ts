export type CartRep = {
    id: string;
    product: {
        id: string;
        urlImage: string;
        name: string;
        price: number;
    };
    quantity: number;
};