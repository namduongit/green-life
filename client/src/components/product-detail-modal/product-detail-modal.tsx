import { useEffect, useState } from "react";
import { useCart } from "../../contexts/cart/cart";
import { useExecute } from "../../hooks/execute";
import { getProductById } from "../../services/product";
import type { ProductRep } from "../../services/product/product.type";

type ProductDetailModalProps = {
    productId: string | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function ProductDetailModal({ productId, isOpen, onClose }: ProductDetailModalProps) {
    const [product, setProduct] = useState<ProductRep | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();
    const { loading, query } = useExecute();

    useEffect(() => {
        if (!isOpen || !productId) {
            setProduct(null);
            return;
        }

        const fetchProduct = async () => {
            try {
                const result = await query<ProductRep>(
                    getProductById(productId)
                );
                if (result?.data) {
                    setProduct(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
                setProduct(null);
            }
        };

        fetchProduct();
    }, [isOpen, productId, query]);

    const handleAddToCart = () => {
        if (product) {
            addItem(product.id, quantity);
            onClose();
        }
    };

    if (!isOpen || !productId) return null;
    if (!product) {
        return (
            <div className="p-6 text-center text-gray-500">
                Đang tải hoặc không tìm thấy sản phẩm
            </div>
        );
    }
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30" onClick={onClose}>
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50 shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[rgb(51,102,51)]"></div>
                    </div>
                ) : product ? (
                    <div className="overflow-hidden">
                        {/* Header với Close button */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[rgb(51,102,51)]">Chi tiết sản phẩm</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Hình ảnh */}
                                <div className="flex flex-col gap-4">
                                    <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                                        <img
                                            src={product.property?.urlImage}
                                            alt={product.property?.name}
                                            className="w-full h-[400px] object-cover"
                                        />
                                        {product.currentStock === 0 && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <span className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold">
                                                    Hết hàng
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Thông tin sản phẩm */}
                                <div className="flex flex-col gap-6">
                                    {/* Tên và giá */}
                                    <div>
                                        <h1 className="text-3xl font-bold text-[rgb(51,102,51)] mb-3">
                                            {product.property?.name}
                                        </h1>
                                        <p className="text-4xl font-bold text-[#66cc00]">
                                            {(product.property?.price ?? 0).toLocaleString("vi-VN")}₫
                                        </p>
                                    </div>

                                    {/* Danh mục */}
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Danh mục</p>
                                        <p className="text-lg font-semibold text-gray-700">
                                            {product.category?.name ?? "Không có danh mục"}
                                        </p>
                                    </div>

                                    {/* Mô tả */}
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                                        <p className="text-gray-700 leading-relaxed">
                                            {product.property?.description}
                                        </p>
                                    </div>

                                    {/* Thông tin chi tiết */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Cân nặng</p>
                                            <p className="font-semibold text-gray-700">
                                                {product.property?.weight} {product.property?.unit}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Kho hàng</p>
                                            <p className="font-semibold text-gray-700">
                                                {product.currentStock} {product.currentStock > 0 ? "sản phẩm" : "(Hết hàng)"}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Dài x Rộng</p>
                                            <p className="font-semibold text-gray-700">
                                                {product.property?.length} x {product.property?.width} cm
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Cao</p>
                                            <p className="font-semibold text-gray-700">
                                                {product.property?.height} cm
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {product.tags && product.tags.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Thẻ</p>
                                            <div className="flex flex-wrap gap-2">
                                                {product.tags.map((tag: any, idx: number) => (
                                                    <span
                                                        key={idx}
                                                        className="bg-[rgb(51,102,51)] bg-opacity-10 text-[rgb(51,102,51)] text-xs font-semibold px-3 py-1 rounded-full"
                                                    >
                                                        {typeof tag === "string" ? tag : tag?.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quantity và Add to cart */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                disabled={product.currentStock === 0}
                                                className="px-3 py-2 text-gray-600 hover:text-[rgb(51,102,51)] disabled:opacity-50"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) =>
                                                    setQuantity(Math.max(1, Math.min(product.currentStock, parseInt(e.target.value) || 1)))
                                                }
                                                min="1"
                                                max={product.currentStock}
                                                disabled={product.currentStock === 0}
                                                className="w-12 text-center border-0 outline-none py-2 disabled:opacity-50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(Math.min(product.currentStock, quantity + 1))}
                                                disabled={product.currentStock === 0}
                                                className="px-3 py-2 text-gray-600 hover:text-[rgb(51,102,51)] disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            disabled={product.currentStock === 0}
                                            className="flex-1 bg-[rgb(51,102,51)] hover:bg-[#66cc00] disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
                                        >
                                            {product.currentStock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        Không tìm thấy sản phẩm
                    </div>
                )}
            </div>
        </div>
    );
}
