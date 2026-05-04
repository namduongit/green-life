import { useNavigate } from "react-router";
import type { ProductRep } from "../../services/product/product.type";

type CardProductProps = {
    product: ProductRep;
    onAddToCart?: (product: ProductRep) => void;
    isAdding?: boolean;
};

function CardProduct({ product, onAddToCart, isAdding }: CardProductProps) {
    const { property, currentStock, tags } = product;
    const navigate = useNavigate();

    if (!property) return null;

    const isOutOfStock = currentStock === 0;
    const isBusy = isAdding ?? false;

    return (
        <div
            className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:border-gray-200 hover:shadow-md"
            onClick={() => navigate(`/page/product/${product.id}`)}
        >
            {/* Image */}
            <div className="relative overflow-hidden bg-gray-50 aspect-square">
                <img
                    src={property.urlImage ?? "/placeholder.png"}
                    alt={property.name ?? "product"}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {isOutOfStock && (
                        <span className="rounded-full bg-gray-700 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            Hết hàng
                        </span>
                    )}
                    {tags && tags.length > 0 && !isOutOfStock && (
                        <span className="rounded-full bg-[rgb(51,102,51)] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            {(tags as any)[0]?.name ?? ""}
                        </span>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-3 p-4">
                {/* Category */}
                {product.category?.name && (
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        {product.category.name}
                    </p>
                )}

                {/* Name */}
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                    {property.name}
                </h3>

                {/* Price + Stock */}
                <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-[rgb(51,102,51)]">
                        {(property.price ?? 0).toLocaleString("vi-VN")}
                        <span className="ml-0.5 text-sm">₫</span>
                    </p>
                    {!isOutOfStock && (
                        <p className="text-[11px] text-gray-400">
                            Còn <span className="font-semibold text-gray-600">{currentStock}</span>
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); navigate(`/page/product/${product.id}`); }}
                        className="flex-1 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:border-[rgb(51,102,51)] hover:text-[rgb(51,102,51)]"
                    >
                        Chi tiết
                    </button>
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onAddToCart?.(product); }}
                        disabled={isOutOfStock || isBusy}
                        className="flex-1 rounded-xl bg-[rgb(51,102,51)] py-2 text-xs font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-[#2d7a2d]"
                    >
                        {isOutOfStock ? "Hết hàng" : isBusy ? "Đang thêm..." : "Thêm vào giỏ"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CardProduct;