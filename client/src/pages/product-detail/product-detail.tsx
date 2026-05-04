import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useExecute } from "../../hooks/execute";
import { useCart } from "../../contexts/cart/cart";
import { getProductById, getRelatedProducts } from "../../services/product";
import type { ProductRep } from "../../services/product/product.type";
import CardProduct from "../../components/card-product/card-product";

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const [product, setProduct] = useState<ProductRep | null>(null);
    const [similarProducts, setSimilarProducts] = useState<ProductRep[]>([]);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<"description" | "specs">("description");

    const { loading, query } = useExecute();
    const { loading: loadingSimilar, query: querySimilar } = useExecute();

    useEffect(() => {
        if (!id) return;

        const loadProduct = async () => {
            const result = await query<ProductRep>(getProductById(id));
            if (result?.data) {
                setProduct(result.data);

                // Load related products
                const simResult = await querySimilar<ProductRep[]>(
                    getRelatedProducts(id, 8)
                );
                if (simResult?.data) {
                    const arr = Array.isArray(simResult.data) ? simResult.data : [];
                    setSimilarProducts(arr);
                }
            } else {
                navigate("/page/product");
            }
        };

        loadProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!product) return;
        setAddingToCart(true);
        await addItem(product.id, quantity);
        setAddingToCart(false);
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity((prev) => Math.max(1, Math.min(prev + delta, product?.currentStock ?? 1)));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[rgb(51,102,51)]"></div>
            </div>
        );
    }

    if (!product || !product.property) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4 text-gray-500">
                <p className="text-lg">Không tìm thấy sản phẩm.</p>
                <Link to="/page/product" className="text-[rgb(51,102,51)] font-semibold underline">
                    Quay lại danh sách sản phẩm
                </Link>
            </div>
        );
    }

    const { property, currentStock, category, tags } = product;
    const isOutOfStock = currentStock === 0;

    return (
        <div className="pb-20">
            {/* Hero breadcrumb */}
            <div className="bg-black text-white py-8 lg:py-10">
                <div className="container mx-auto px-5 lg:px-20">
                    <h1 className="text-2xl lg:text-4xl font-semibold">{property.name}</h1>
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-300">
                        <Link to="/" className="hover:text-white">Trang chủ</Link>
                        <span>/</span>
                        <Link to="/page/product" className="hover:text-white">Sản phẩm</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{property.name}</span>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-5 lg:px-20 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product image */}
                    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[320px]">
                        <img
                            src={property.urlImage ?? "/placeholder.png"}
                            alt={property.name}
                            className="w-full object-cover"
                        />
                    </div>

                    {/* Product info */}
                    <div className="flex flex-col gap-5">
                        {/* Category + tags */}
                        <div className="flex flex-wrap gap-2">
                            {category && (
                                <span className="text-xs font-semibold px-3 py-1 rounded-full border border-[rgb(51,102,51)] text-[rgb(51,102,51)]">
                                    {category.name}
                                </span>
                            )}
                            {tags && tags.map((tag: any) => (
                                <span
                                    key={tag.id}
                                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600"
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-[rgb(51,102,51)]">
                            {property.name}
                        </h2>

                        <p className="text-3xl font-bold text-[#333]">
                            {(property.price ?? 0).toLocaleString("vi-VN")}₫
                        </p>

                        {/* Stock status */}
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-block w-2.5 h-2.5 rounded-full ${
                                    isOutOfStock ? "bg-red-500" : "bg-green-500"
                                }`}
                            ></span>
                            <span className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-green-700"}`}>
                                {isOutOfStock ? "Hết hàng" : `Còn hàng (${currentStock})`}
                            </span>
                        </div>

                        {/* Quantity selector */}
                        {!isOutOfStock && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-600">Số lượng:</span>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="px-4 py-2 text-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        −
                                    </button>
                                    <span className="px-5 py-2 text-center min-w-[3rem] font-semibold text-gray-800 border-x border-gray-200">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= currentStock}
                                        className="px-4 py-2 text-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-2">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || addingToCart}
                                className="flex-1 bg-[rgb(51,102,51)] hover:bg-[#2d7a2d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl"
                            >
                                {addingToCart ? "Đang thêm..." : isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                            </button>
                            <Link
                                to="/page/cart"
                                onClick={!isOutOfStock ? handleAddToCart : undefined}
                                className="flex-1 text-center border border-[rgb(51,102,51)] text-[rgb(51,102,51)] hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl"
                            >
                                Mua ngay
                            </Link>
                        </div>

                        {/* Specs overview */}
                        <div className="mt-4 grid grid-cols-2 gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
                            {property.weight && (
                                <div>
                                    <span className="text-xs text-gray-400 block">Trọng lượng</span>
                                    <span className="text-sm font-semibold text-gray-700">{property.weight} {property.unit}</span>
                                </div>
                            )}
                            {(property.length || property.width || property.height) ? (
                                <div>
                                    <span className="text-xs text-gray-400 block">Kích thước (D×R×C)</span>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {property.length}×{property.width}×{property.height} cm
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Tabs: description & specs */}
                <div className="mt-14">
                    <div className="flex border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => setActiveTab("description")}
                            className={`px-6 py-3 text-sm font-semibold border-b-2 ${
                                activeTab === "description"
                                    ? "border-[rgb(51,102,51)] text-[rgb(51,102,51)]"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Mô tả sản phẩm
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("specs")}
                            className={`px-6 py-3 text-sm font-semibold border-b-2 ${
                                activeTab === "specs"
                                    ? "border-[rgb(51,102,51)] text-[rgb(51,102,51)]"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Thông số kỹ thuật
                        </button>
                    </div>

                    <div className="py-6">
                        {activeTab === "description" ? (
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line max-w-3xl">
                                {property.description || "Chưa có mô tả cho sản phẩm này."}
                            </div>
                        ) : (
                            <div className="max-w-lg">
                                <table className="w-full text-sm border-collapse">
                                    <tbody>
                                        {[
                                            { label: "Tên sản phẩm", value: property.name },
                                            { label: "Giá", value: `${(property.price ?? 0).toLocaleString("vi-VN")}₫` },
                                            { label: "Trọng lượng", value: property.weight ? `${property.weight} ${property.unit}` : "—" },
                                            { label: "Chiều dài", value: property.length ? `${property.length} cm` : "—" },
                                            { label: "Chiều rộng", value: property.width ? `${property.width} cm` : "—" },
                                            { label: "Chiều cao", value: property.height ? `${property.height} cm` : "—" },
                                            { label: "Danh mục", value: category?.name ?? "—" },
                                            { label: "Tình trạng", value: isOutOfStock ? "Hết hàng" : "Còn hàng" },
                                        ].map((row) => (
                                            <tr key={row.label} className="border-b border-gray-100">
                                                <td className="py-3 pr-6 text-gray-500 font-medium w-40">{row.label}</td>
                                                <td className="py-3 text-gray-800 font-semibold">{row.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Similar products */}
                {(similarProducts.length > 0 || loadingSimilar) && (
                    <div className="mt-14">
                        <h3 className="text-xl lg:text-2xl font-bold text-[rgb(51,102,51)] mb-6">
                            Sản phẩm tương tự
                        </h3>
                        {loadingSimilar ? (
                            <div className="flex justify-center py-10">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[rgb(51,102,51)]"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {similarProducts.slice(0, 8).map((p) => (
                                    <CardProduct
                                        key={p.id}
                                        product={p}
                                        onAddToCart={(item) => addItem(item.id, 1)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;
