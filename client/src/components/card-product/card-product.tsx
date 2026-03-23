import { useNavigate } from "react-router";
import type { GetProductRep } from "../../services/product/product.type";

type CardProductProps = {
    product: GetProductRep;
    onAddToCart?: (product: GetProductRep) => void;
    isAdding?: boolean;
};

function CardProduct({ product, onAddToCart, isAdding }: CardProductProps) {
    const { property, currentStock } = product;
    const isOutOfStock = currentStock === 0;
    const isBusy = isAdding ?? false;
    const navigate = useNavigate();

    const handleViewDetail = () => {
        const targetId = product.id ?? property.id;
        navigate(`/page/detail/${targetId}`);
    };

    return (
        <div className="group relative flex flex-col bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300">
            <div className="relative overflow-hidden bg-gray-50">
                <img
                    src={property.urlImage}
                    alt={property.name}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {isOutOfStock && (
                    <span className="absolute top-2 left-2 bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Hết hàng
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1 px-4 pt-3 pb-28">
                <h3 className="text-lg font-semibold text-[rgb(51,102,51)] line-clamp-2 leading-snug">
                    {property.name}
                </h3>
                <p className="text-lg font-bold text-[#66cc00]">
                    {property.price.toLocaleString("vi-VN")}₫
                </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out px-4 pb-3">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleViewDetail}
                        className="w-full border border-[rgb(51,102,51)] text-[rgb(51,102,51)] hover:border-[#66cc00] hover:text-[#66cc00] text-md font-semibold py-2 rounded-xl transition-colors duration-200 bg-white"
                    >
                        Chi tiết sản phẩm
                    </button>
                    <button
                        onClick={() => onAddToCart?.(product)}
                        disabled={isOutOfStock || isBusy}
                        className="w-full bg-[rgb(51,102,51)] hover:bg-[#66cc00] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-md font-semibold py-2 rounded-xl transition-colors duration-200"
                    >
                        {isOutOfStock
                            ? "Hết hàng"
                            : isBusy
                                ? "Đang thêm..."
                                : "Thêm vào giỏ hàng"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CardProduct;