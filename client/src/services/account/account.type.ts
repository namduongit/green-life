import type {
    Account,
    Address,
    CartItem,
    Product,
} from "../../lib/types/models.type";

type AccountRep = Account;
type AddressRep = Omit<Address, "createdAt" | "updatedAt">;
type AddressForm = Pick<Address, "province" | "city" | "home">;
type CartItemRep = CartItem & {
    product: Product;
};

type AddToCartForm = Pick<CartItem, "productId" | "quantity">;

type CreateAccountForm = Pick<Account, "email" | "role"> & {
    password: string;
};

type UpdateAccountForm = Partial<CreateAccountForm>;

type SearchAccountParams = {
    page?: number;
    pageSize?: number;
};

export type {
    AccountRep,
    AddressRep,
    AddressForm,
    CartItemRep,
    AddToCartForm,
    CreateAccountForm,
    UpdateAccountForm,
    SearchAccountParams,
};
