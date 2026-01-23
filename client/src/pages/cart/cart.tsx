import LayerCart from "../../components/layer-cart/layer-cart";

const CartPage = () => {
    const items = [
        {
            id: "12397e6b-2c61-4906-ad6f-fa5a45bd472d",
            productId: "d78748f9-d52f-4dbb-a78f-bb801f751515",
            imageUrl: "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/5_11zon-3.webp?resize=800%2C800&ssl=1",
            name: "Ống Hút Cỏ Bàng GREENLIFE – Hộp 100 ống – Size 20cm",
            quantity: 1,
            price: 29000
        },
        {
            id: "12397e6b-2c61-4906-ad6f-fa5a45bd472d",
            productId: "d78748f9-d52f-4dbb-a78f-bb801f751515",
            imageUrl: "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/5_11zon-3.webp?resize=800%2C800&ssl=1",
            name: "Ống Hút Cỏ Bàng GREENLIFE – Hộp 100 ống – Size 20cm",
            quantity: 1,
            price: 29000
        }
    ]

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
                        {items.map((cartItem, idx) => (
                            <div key={idx} className="flex gap-3 py-2
                                border-b border-gray-300">
                                <div className="flex-2 flex gap-2">
                                    <img src={cartItem.imageUrl} className="w-20 aspect-square" />
                                    <h1 className="text-[16px]">{cartItem.name}</h1>
                                </div>
                                <div className="flex-1">{cartItem.price} đ</div>
                                <div className="flex-1">{cartItem.quantity}</div>
                                <div className="flex-1">{cartItem.price * cartItem.quantity} đ</div>
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
                            <span>68.000 đ</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 py-3">
                            <h2>VAT</h2>
                            <span>10.000 đ</span>
                        </div>
                        <div className="flex justify-between py-3">
                            <h2>Tổng</h2>
                            <span>71.400 đ</span>
                        </div>
                    </div>
                    <div className="text-gray-500">
                        <span className="before:content-['*'] before:text-red-700 before:pe-1">Phí vận chuyển sẽ được tính trong quá trình vận chuyển hàng hóa.
                            Đảm bảo không vượt quá 3% (tối thiểu 15.000 đ) giá trị đơn hàng.</span>
                    </div>
                    <div className="flex justify-end">
                        <button className="bg-green-700 px-3 py-2 text-white rounded hover:bg-green-800 transition-colors">TIẾN HÀNH THANH TOÁN</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage;