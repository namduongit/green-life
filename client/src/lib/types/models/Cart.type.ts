export type Cart = {
    id: string;
    accountId: string;
};

export type CartItem = {
    id: string;
    quantity: number;
    productId: string;
    cartId: string;
};
