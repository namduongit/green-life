import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import LayerCart from "../../components/layer-cart/layer-cart";
import { useCart } from "../../contexts/cart/cart";

const CartPage = () => {
    const { cartItems, addItem, removeItem } = useCart();
    const navigate = useNavigate();

    const [totalPrice, setTotalPrice] = useState<number>(0);
    useEffect(() => {
        let total = 0;
        cartItems.forEach((cartItem) => {
            total += cartItem.quantity * cartItem.product.price;
        });
        setTotalPrice(total);
    }, [cartItems]);

    const handleIncrease = (productId: string) => {
        void addItem(productId, 1);
    };

    const handleDecrease = (productId: string, currentQuantity: number) => {
        if (currentQuantity <= 1) {
            return;
        }
        void addItem(productId, -1);
    };

    return (
        <div className="pb-15">
            <LayerCart />
            <div className="sm-container mx-auto flex py-10 gap-20">
                <div className="flex-2 space-y-2">
                    <div className="flex">
                        <div className="flex-2 font-semibold text-lg text-green-700">SẢN PHẨM</div>
                        <div className="flex-1 font-semibold text-lg text-green-700">GIÁ</div>
                        <div className="flex-1 font-semibold text-lg text-green-700">SỐ LƯỢNG</div>
                        <div className="flex-1 font-semibold text-lg text-green-700">THÀNH TIỀN</div>
                    </div>
                    <div className="flex flex-col">
                        {cartItems.map((cartItem, idx) => (
                            <div key={`${cartItem.product.id ?? cartItem.id}-${idx}`} className="flex gap-3 py-4 border-b border-gray-300">
                                <div className="flex-2 flex gap-3">
                                    <img src={cartItem.product.urlImage} className="w-20 aspect-square rounded-md object-cover" />
                                    <div className="flex flex-col gap-1">
                                        <h1 className="text-[16px] font-medium text-gray-800 line-clamp-2">{cartItem.product.name}</h1>
                                        <button
                                            type="button"
                                            onClick={() => void removeItem(cartItem.product.id)}
                                            className="w-fit text-sm text-red-600 hover:underline"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 font-medium text-gray-700">
                                    {cartItem.product.price.toLocaleString("vi-VN")} đ
                                </div>
                                <div className="flex-1">
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
                                </div>
                                <div className="flex-1 font-semibold text-green-700">
                                    {(cartItem.product.price * cartItem.quantity).toLocaleString("vi-VN")} đ
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between pt-2">
                        <div className="flex gap-2 items-center">
                            <div className="ring-1 ring-gray-400 focus-within:ring-2 focus-within:ring-green-700 w-50 rounded flex items-center ps-2">
                                <i className="fa-solid fa-ticket text-gray-500"></i>
                                <input type="text" className="none-input py-1 ps-2 w-full" />
                            </div>
                            <div>
                                <button className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800">Áp dụng</button>
                            </div>
                        </div>
                        <div>
                            <button className="bg-white ring-2 ring-green-700 text-green-700 px-3 py-1 rounded
                                hover:bg-green-700 hover:text-white transition-all">Làm mới giỏ hàng</button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    <h1 className="text-2xl font-semibold text-green-700 text-center">Tổng cộng giỏ hàng</h1>
                    <div className="border-2 border-gray-300 px-3 rounded-md">
                        <div className="flex justify-between border-b border-gray-300 py-3">
                            <h2>Tạm tính</h2>
                            <span>{totalPrice.toLocaleString()} đ</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 py-3">
                            <h2>VAT</h2>
                            <span>10.000 đ</span>
                        </div>
                        <div className="flex justify-between py-3">
                            <h2>Tổng</h2>
                            <span>{(totalPrice + 10000).toLocaleString()} đ</span>
                        </div>
                    </div>
                    <div className="text-gray-500">
                        <span className="before:content-['*'] before:text-red-700 before:pe-1">Phí vận chuyển sẽ được tính trong quá trình vận chuyển hàng hóa.
                            Đảm bảo không vượt quá 3% (tối thiểu 15.000 đ) giá trị đơn hàng.</span>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/page/checkout")}
                            className="bg-green-700 px-3 py-2 text-white rounded hover:bg-green-800 transition-colors"
                        >
                            TIẾN HÀNH THANH TOÁN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage;