import { useState } from "react";
import CartDetail from "../cart-detail/cart-detail";
import { useCart } from "../../contexts/cart/cart";

const CartIcon = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { cartItems } = useCart();

    return (
        <div className="relative">
            <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
            </span>
            <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                <i className={`fa-solid fa-cart-shopping hover:text-green-700 ${isOpen && "text-green-700"} transition-colors"`}></i>
            </div>
            <CartDetail isShowCartDetail={isOpen} setIsShowCardDetail={setIsOpen} />
        </div>
    )
}

export default CartIcon;