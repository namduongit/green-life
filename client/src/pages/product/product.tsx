const ProductPage = () => {
    return (
        <div className="pb-15">
            <div className="bg-black text-white flex flex-col items-center py-8 lg:py-12 gap-3">
                <h1 className="text-2xl lg:text-6xl font-semibold">Sản phẩm của chúng tôi</h1>
            </div>
            <div className="container mx-auto">
                <div className="py-10 flex justify-between">
                <div className="space-x-2">
                    <span className="text-gray-700">
                        <a href="/">Trang chủ</a>
                    </span>
                    <span>/</span>
                    <span className="font-semibold">Sản phẩm</span>
                </div>

                {/* Search options */}
                <div className="flex items-center">
                    <div>
                        <select>
                            <option value="">Sắp xếp mặc định</option>
                        </select>
                    </div>
                    <div className="relative">
                        <i className="fa-solid fa-filter"></i>

                    </div>
                </div>
            </div>

            <div>
                product
            </div>

            <div>
                pagination
            </div>
            </div>
        </div>
    )
}

export default ProductPage;