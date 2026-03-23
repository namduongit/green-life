import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "../auth/auth";
import { useExecute } from "../../hooks/execute";
import { addProductToCart, clearCartItems, getCartItems, removeProductFromCart, type CartRep } from "../../services/cart";
import { useToastContext } from "../toast-message/toast-message";

type CartContextValue = {
    addItem: (productId: string, quantity: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    cartItems: CartRep[];
}

const CardContext = createContext<CartContextValue>({
    addItem: async () => { },
    removeItem: async () => { },
    clearCart: async () => { },
    cartItems: []
});

const CardProvider = ({ children }: { children: React.ReactNode }) => {
    const { query } = useExecute();
    const { state } = useAuthContext();
    const [cartItems, setCartItems] = useState<CartRep[]>([]);

    const { showToast } = useToastContext();

    const loadCart = async (uid: string) => {
        const result = await query<CartRep[]>(getCartItems(uid));
        if (result && result.data) {
            setCartItems(result.data);
        }
    }

    useEffect(() => {
        if (state) {
            const uid = state.uid;
            loadCart(uid);
        }
    }, [state]);

    const addItem = async (productId: string, quantity: number) => {
        const result = await query(addProductToCart(state!.uid, { productId, quantity }));
        if (result && result.data) {
            showToast("Success", "Sản phẩm đã được thêm vào giỏ hàng.");
            await loadCart(state!.uid);
        }
    }

    const removeItem = async (productId: string) => {
        const result = await query(removeProductFromCart(state!.uid, productId));
        if (result) {
            showToast("Success", "Sản phẩm đã được xóa khỏi giỏ hàng.");
            await loadCart(state!.uid);
        }
    }

    const clearCart = async () => {
        const result = await query(clearCartItems(state!.uid));
        if (result) {
            await loadCart(state!.uid);
        }

    }

    return (
        <CardContext.Provider value={{ addItem, removeItem, clearCart, cartItems }}>
            {children}
        </CardContext.Provider>
    );
}

const useCart = () => {
    const context = useContext(CardContext);
    if (!context) {
        throw new Error("useCart must be used within CardProvider");
    }
    return context;
}

export { CardProvider, useCart };
