import { useEffect, useState } from "react";
import { useCart } from "../../contexts/cart/cart";
import { useNavigate } from "react-router";

const CartDetail = ({ isShowCartDetail, setIsShowCardDetail }: { isShowCartDetail: boolean, setIsShowCardDetail: (v: boolean) => void }) => {
    if (!isShowCartDetail) return;

    const navigate = useNavigate();

    const { cartItems, addItem, removeItem } = useCart();
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const handleIncrease = (productId: string) => {
        void addItem(productId, 1);
    };

    const handleDecrease = (productId: string, currentQuantity: number) => {
        if (currentQuantity <= 1) {
            return;
        }
        void addItem(productId, -1);
    };
    
    useEffect(() => {
        let total = 0;
        cartItems.forEach((cartItem) => {
            total += cartItem.quantity * cartItem.product.price;
        });
        setTotalPrice(total);
    }, [cartItems]);

    return (
        <div className="fixed z-30 top-0 left-0 w-full h-screen bg-gray-800/60" onClick={() => setIsShowCardDetail(false)}>
            <div className="w-full sm:w-85 h-screen bg-white ms-auto flex flex-col" onClick={(event) => event.stopPropagation()}>
                <div className="flex justify-between items-center py-4 px-5 border-b border-gray-300">
                    <h1 className="text-green-700 text-xl font-semibold">Giỏ hàng</h1>
                    <div className="flex items-center gap-1 text-md text-gray-600">
                        <button onClick={() => setIsShowCardDetail(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {cartItems.map((cartItem, idx) => (
                        <div key={cartItem.product.id ?? idx} className="flex gap-3 px-4 py-2
                            border-b border-gray-300">
                            <div>
                                <img src={cartItem.product.urlImage} className="w-30 aspect-square" />
                            </div>
                            <div className="flex-1 flex justify-between flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="flex-1 text-[16px]">{cartItem.product.name}</h1>

                                    <div className="text-gray-500 p-2">
                                        <button type="button" onClick={() => void removeItem(cartItem.product.id)}>
                                            x
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDecrease(cartItem.product.id, cartItem.quantity)}
                                            disabled={cartItem.quantity <= 1}
                                            className="flex items-center justify-center px-2 border border-gray-300 text-lg font-semibold text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-50 rounded"
                                        >
                                            -
                                        </button>
                                        <span className="min-w-8 text-center text-sm font-medium">
                                            {cartItem.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleIncrease(cartItem.product.id)}
                                            className="flex items-center justify-center px-2 border border-[rgb(51,102,51)] bg-[rgb(51,102,51)] text-lg font-semibold text-white transition hover:bg-[#66cc00] hover:border-[#66cc00] rounded"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-green-700 font-semibold">
                                        {cartItem.product.price.toLocaleString("vi-VN")} đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="py-4 px-5 gap-2 border-t border-gray-300 space-y-5">
                    <div className="flex justify-between items-center">
                        <h1 className="font-semibold text-xl">Tổng tiền: </h1>
                        <span className="text-green-700 text-lg">{totalPrice.toLocaleString()} đ</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button className="bg-gray-300 py-2 rounded"
                            onClick={() => {
                                setIsShowCardDetail(false);
                                navigate("/page/cart");
                            }}
                        >XEM GIỎ HÀNG</button>
                        <button className="bg-green-700 py-2 rouned text-white"
                            onClick={() => {
                                setIsShowCardDetail(false);
                                navigate("/page/checkout");
                            }}
                        >THANH TOÁN</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartDetail;