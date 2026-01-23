type CartItem = {
    id: string,
    name: string,
    productId: string,
    quantity: number,
    price: number
}

type CartDetail = {
    
}

const CartDetail = ({ isShowCartDetail, setIsShowCardDetail }: { isShowCartDetail: boolean, setIsShowCardDetail: (v: boolean) => void }) => {
    if (!isShowCartDetail) return;

    return (
        <div className="absolute top-0 left-0 w-full h-screen bg-gray-800/60">
            <div className="w-full sm:w-85 h-screen bg-white ms-auto flex flex-col">
                <div className="flex justify-between items-center py-4 px-5 border-b border-gray-300">
                    <h1 className="text-green-700 text-xl font-semibold">Giỏ hàng</h1>
                    <div className="flex items-center gap-1 text-md text-gray-600">
                        <button onClick={() => setIsShowCardDetail(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                        {[
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
                        },
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
                        },
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
                        },
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
                        },
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
                        ].map((cartItem, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-3 px-4 py-2
                            border-b border-gray-300">
                                <div>
                                    <img src={cartItem.imageUrl} className="w-30 aspect-square" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex">
                                        <h1 className="text-[16px]">{cartItem.name}</h1>
                                        <div className="text-gray-500 p-2">
                                            <button>x</button>
                                        </div>
                                    </div>
                                    <p className="flex items-center gap-1">
                                        <p>{cartItem.quantity}</p> 
                                        <p className="text-sm">x</p>
                                        <p className="text-green-700">{cartItem.price} đ</p>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                <div className="py-4 px-5 gap-2 border-t border-gray-300 space-y-5">
                    <div className="flex justify-between items-center">
                        <h1 className="font-semibold text-xl">Tổng tiền: </h1>
                        <span className="text-green-700 text-lg">100.000 đ</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button className="bg-gray-300 py-2 rounded">XEM GIỎ HÀNG</button>
                        <button className="bg-green-700 py-2 rouned text-white">THANH TOÁN</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartDetail;