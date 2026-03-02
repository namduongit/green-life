type AccountRep = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    role: string;
    isLock: boolean;
}

type AddressRep = {
    id: string;
    province: string;
    city: string;
    home: string;
    accountId: string;
    createdAt: Date;
    updatedAt: Date;
}

type AddressForm = {
    province: string;
    city: string;
    home: string;
}

type CartItemRep = {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    product?: {
        id: string;
        name: string;
        price: number;
        description: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

type CartRep = {
    id: string;
    accountId: string;
    items: CartItemRep[];
    createdAt: Date;
    updatedAt: Date;
}

type AddToCartForm = {
    productId: string;
    quantity: number;
}

type CreateAccountForm = {
    email: string;
    password: string;
    role: string;
}

type UpdateAccountForm = {
    email?: string;
    password?: string;
    role?: string;
}

export type { AccountRep, AddressRep, AddressForm, CartItemRep, CartRep, AddToCartForm, CreateAccountForm, UpdateAccountForm }