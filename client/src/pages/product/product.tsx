import { useEffect, useState } from "react";
import CardProduct from "../../components/card-product/card-product";
import InputSearch from "../../components/input/input-search/input-search";
import ProductDetailModal from "../../components/product-detail-modal/product-detail-modal";
import { useExecute } from "../../hooks/execute";
import { useCart } from "../../contexts/cart/cart";
import { getAllProducts } from "../../services/product";
import type { ProductRep } from "../../services/product/product.type";

type SortOption = "default" | "price-asc" | "price-desc";

const ProductPage = () => {
    const [products, setProducts] = useState<ProductRep[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [onlyInStock, setOnlyInStock] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { loading, query } = useExecute();
    const { addItem } = useCart();

    useEffect(() => {
        const loadProducts = async () => {
            const result = await query<ProductRep[]>(
                getAllProducts(0, 200),
            );

            if (result?.data) {
                setProducts(result.data);
                setError(null);
                return;
            }

            if (result?.errors) {
                const formattedError = Array.isArray(result.errors)
                    ? result.errors.join(", ")
                    : result.errors;
                setError(formattedError ?? "Không thể tải dữ liệu sản phẩm.");
                setProducts([]);
            }
        };

        loadProducts();
    }, []);

    // Lọc và sắp xếp sản phẩm
    const filteredProducts = products
        .filter((product) => {
            // Lọc theo tên
            if (searchValue && !product.property?.name.toLowerCase().includes(searchValue.toLowerCase())) {
                return false;
            }
            // Lọc theo danh mục
            if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
                return false;
            }
            // Lọc theo kho hàng
            if (onlyInStock && product.currentStock === 0) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortOption === "price-asc") {
                return (a.property?.price ?? 0) - (b.property?.price ?? 0);
            }
            if (sortOption === "price-desc") {
                return (b.property?.price ?? 0) - (a.property?.price ?? 0);
            }
            return 0;
        });

    // Lấy danh sách danh mục duy nhất
    const categories = Array.from(
        new Map(
            products.map((p: ProductRep) => [p.categoryId, p.category])
        ).values()
    );

    return (
        <div className="pb-15">
            <div className="bg-black text-white flex flex-col items-center py-8 lg:py-12 gap-3">
                <h1 className="text-2xl lg:text-6xl font-semibold">Sản phẩm của chúng tôi</h1>
                <p className="text-center text-base lg:text-lg text-gray-200">
                    Khám phá các sản phẩm cỏ bàng bền vững được tuyển chọn kỹ lưỡng.
                </p>
            </div>

            <div className="container mx-auto px-5 lg:px-20">
                <div className="py-10 flex flex-col gap-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-x-2 text-sm">
                            <span className="text-gray-700">
                                <a href="/">Trang chủ</a>
                            </span>
                            <span>/</span>
                            <span className="font-semibold text-[rgb(51,102,51)]">Sản phẩm</span>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <InputSearch
                                searchInput={searchValue}
                                setSearchInput={setSearchValue}
                                opts={{ width: "w-full md:w-80" }}
                            />

                            <select
                                value={selectedCategoryId}
                                onChange={(event) => setSelectedCategoryId(event.target.value)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#66cc00]"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={sortOption}
                                onChange={(event) =>
                                    setSortOption(event.target.value as SortOption)
                                }
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#66cc00]"
                            >
                                <option value="default">Sắp xếp mặc định</option>
                                <option value="price-asc">Giá: Thấp đến cao</option>
                                <option value="price-desc">Giá: Cao đến thấp</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => setOnlyInStock((prev) => !prev)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${onlyInStock
                                        ? "border-[rgb(51,102,51)] bg-[rgb(51,102,51)] text-white"
                                        : "border-gray-200 text-gray-700 hover:border-[rgb(51,102,51)]"
                                    }`}
                            >
                                {onlyInStock ? "Đang lọc: còn hàng" : "Hiển thị sản phẩm còn hàng"}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 text-gray-600">
                        <p>
                            {loading
                                ? "Đang tải sản phẩm..."
                                : `${filteredProducts.length} sản phẩm được tìm thấy`}
                        </p>
                        {error && (
                            <span className="text-sm text-red-600">
                                {error}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex w-full justify-center py-20">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[rgb(51,102,51)]"></div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {filteredProducts.map((product: ProductRep) => (
                                <CardProduct
                                    key={product.id}
                                    product={product}
                                    onAddToCart={(item: ProductRep) => addItem(item.id, 1)}
                                    onViewDetail={(id: string) => {
                                        setSelectedProductId(id);
                                        setIsModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-500">
                            Không tìm thấy sản phẩm phù hợp với tiêu chí lọc.
                        </div>
                    )}
                </div>
            </div>

            <ProductDetailModal
                productId={selectedProductId}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProductId(null);
                }}
            />
        </div>
    );
};

export default ProductPage;