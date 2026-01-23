import { useState } from "react";
import CartDetail from "../cart-detail/cart-detail";

const CartIcon = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <div>
            <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                <i className={`fa-solid fa-cart-shopping hover:text-green-700 ${isOpen && "text-green-700"} transition-colors"`}></i>
            </div>
            <CartDetail isShowCartDetail={isOpen} setIsShowCardDetail={setIsOpen} />
        </div>
    )
}

export default CartIcon;