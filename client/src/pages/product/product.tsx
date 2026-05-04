import { useEffect, useState, useMemo, useCallback } from "react";
import CardProduct from "../../components/card-product/card-product";
import InputSearch from "../../components/input/input-search/input-search";
import { useExecute } from "../../hooks/execute";
import { useCart } from "../../contexts/cart/cart";
import { getAllProducts } from "../../services/product";
import type { PaginationRep, ProductRep } from "../../services/product/product.type";

type SortOption = "default" | "price-asc" | "price-desc";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/* ─── Pagination component ─── */
const Pagination = ({
    pagination,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: {
    pagination: PaginationRep;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}) => {
    const { page, totalPages, total } = pagination;
    const [jumpValue, setJumpValue] = useState("");

    const pages: (number | "...")[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= page - delta && i <= page + delta)
        ) {
            pages.push(i);
        } else if (
            (i === page - delta - 1 && i > 1) ||
            (i === page + delta + 1 && i < totalPages)
        ) {
            pages.push("...");
        }
    }

    const handleJump = () => {
        const n = parseInt(jumpValue, 10);
        if (!isNaN(n) && n >= 1 && n <= totalPages) {
            onPageChange(n);
        }
        setJumpValue("");
    };

    return (
        <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-100">

            {/* Row 1: Page info + pageSize selector */}
            <div className="flex flex-wrap items-center justify-between w-full gap-3 text-sm text-gray-500">
                <span>
                    Hiển thị{" "}
                    <span className="font-semibold text-gray-700">
                        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
                    </span>{" "}
                    trong tổng{" "}
                    <span className="font-semibold text-gray-700">{total}</span>{" "}
                    sản phẩm
                </span>

                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Hiển thị</span>
                    <select
                        value={pageSize}
                        onChange={e => onPageSizeChange(Number(e.target.value))}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[rgb(51,102,51)]"
                    >
                        {PAGE_SIZE_OPTIONS.map(n => (
                            <option key={n} value={n}>{n} / trang</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Row 2: Prev + page buttons + Next + jump */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
                {/* Prev */}
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-40 hover:border-[rgb(51,102,51)] hover:text-[rgb(51,102,51)]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-gray-400">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p as number)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium ${
                                p === page
                                    ? "border-[rgb(51,102,51)] bg-[rgb(51,102,51)] text-white"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-[rgb(51,102,51)] hover:text-[rgb(51,102,51)]"
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-40 hover:border-[rgb(51,102,51)] hover:text-[rgb(51,102,51)]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Separator */}
                <div className="mx-1 h-6 w-px bg-gray-200" />

                {/* Jump to page */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span>Đến trang</span>
                    <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={jumpValue}
                        onChange={e => setJumpValue(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleJump()}
                        placeholder={String(page)}
                        className="w-14 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm text-gray-700 focus:outline-none focus:border-[rgb(51,102,51)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        type="button"
                        onClick={handleJump}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:border-[rgb(51,102,51)] hover:text-[rgb(51,102,51)]"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Main page ─── */
const ProductPage = () => {
    const [products, setProducts] = useState<ProductRep[]>([]);
    const [pagination, setPagination] = useState<PaginationRep | null>(null);

    // Filters — server-side
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

    // Filters — client-side (local sort + stock)
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [onlyInStock, setOnlyInStock] = useState(false);

    // All categories collected from all pages (kept in memory)
    const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);

    const [error, setError] = useState<string | null>(null);

    const { loading, query } = useExecute();
    const { addItem } = useCart();

    const fetchProducts = useCallback(async (page: number, search: string, catId: string, size: number) => {
        const result = await query(
            getAllProducts({
                page,
                pageSize: size,
                nameContains: search || undefined,
                categoryId: catId || undefined,
            })
        );

        if (result?.data) {
            const pageData = result.data as any;
            // result.data = { data: ProductRep[], pagination: PaginationRep }
            const items: ProductRep[] = Array.isArray(pageData) ? pageData : (pageData.data ?? []);
            const pag: PaginationRep | undefined = pageData.pagination;

            setProducts(items);
            setPagination(pag ?? null);
            setError(null);

            // Gom categories từ trang này nếu chưa có
            setAllCategories(prev => {
                const map = new Map(prev.map(c => [c.id, c]));
                items.filter(p => p.category).forEach(p => {
                    if (!map.has(p.category.id)) {
                        map.set(p.category.id, p.category);
                    }
                });
                return Array.from(map.values());
            });
        } else if (result?.errors) {
            const err = Array.isArray(result.errors) ? result.errors.join(", ") : result.errors;
            setError(err ?? "Không thể tải dữ liệu sản phẩm.");
            setProducts([]);
        }
    }, [query]);

    // Fetch khi page / search / category / pageSize thay đổi
    useEffect(() => {
        fetchProducts(currentPage, searchValue, selectedCategoryId, pageSize);
    }, [currentPage, searchValue, selectedCategoryId, pageSize]);

    // Khi search / category / pageSize thay đổi → reset về trang 1
    const handleSearchChange = (val: string) => {
        setSearchValue(val);
        setCurrentPage(1);
    };
    const handleCategoryChange = (catId: string) => {
        setSelectedCategoryId(catId);
        setCurrentPage(1);
    };
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    // Sort & stock filter trên client (chỉ ảnh hưởng hiển thị, không gọi server)
    const displayedProducts = useMemo(() => {
        return [...products]
            .filter(p => !onlyInStock || p.currentStock > 0)
            .sort((a, b) => {
                if (sortOption === "price-asc") return (a.property?.price ?? 0) - (b.property?.price ?? 0);
                if (sortOption === "price-desc") return (b.property?.price ?? 0) - (a.property?.price ?? 0);
                return 0;
            });
    }, [products, sortOption, onlyInStock]);

    return (
        <div className="pb-16">
            {/* Hero */}
            <div className="bg-gray-900 text-white flex flex-col items-center py-10 lg:py-14 gap-3">
                <h1 className="text-2xl lg:text-5xl font-semibold">Sản phẩm của chúng tôi</h1>
                <p className="text-center text-base text-gray-300">
                    Khám phá các sản phẩm cỏ bàng bền vững được tuyển chọn kỹ lưỡng.
                </p>
            </div>

            <div className="container mx-auto px-5 lg:px-20">
                <div className="py-8 flex flex-col gap-6">

                    {/* Breadcrumb + Toolbar */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-x-2 text-sm">
                            <a href="/" className="text-gray-500 hover:text-[rgb(51,102,51)]">Trang chủ</a>
                            <span className="text-gray-300">/</span>
                            <span className="font-semibold text-[rgb(51,102,51)]">Sản phẩm</span>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            <InputSearch
                                searchInput={searchValue}
                                setSearchInput={handleSearchChange}
                                opts={{ width: "w-full md:w-72" }}
                            />

                            <select
                                value={selectedCategoryId}
                                onChange={e => handleCategoryChange(e.target.value)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-[rgb(51,102,51)]"
                            >
                                <option value="">Tất cả danh mục</option>
                                {allCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <select
                                value={sortOption}
                                onChange={e => setSortOption(e.target.value as SortOption)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-[rgb(51,102,51)]"
                            >
                                <option value="default">Sắp xếp mặc định</option>
                                <option value="price-asc">Giá: Thấp đến cao</option>
                                <option value="price-desc">Giá: Cao đến thấp</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => setOnlyInStock(prev => !prev)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium ${onlyInStock
                                        ? "border-[rgb(51,102,51)] bg-[rgb(51,102,51)] text-white"
                                        : "border-gray-200 text-gray-700 hover:border-[rgb(51,102,51)]"
                                    }`}
                            >
                                {onlyInStock ? "Đang lọc: còn hàng" : "Chỉ còn hàng"}
                            </button>
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                            {loading
                                ? "Đang tải sản phẩm..."
                                : pagination
                                    ? `${pagination.total} sản phẩm · Trang ${pagination.page}/${pagination.totalPages}`
                                    : `${displayedProducts.length} sản phẩm`}
                        </span>
                        {error && <span className="text-red-500">{error}</span>}
                    </div>

                    {/* Product grid */}
                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {Array.from({ length: pageSize }).map((_, i) => (
                                <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
                            ))}
                        </div>
                    ) : displayedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {displayedProducts.map((product: ProductRep) => (
                                <CardProduct
                                    key={product.id}
                                    product={product}
                                    onAddToCart={(item: ProductRep) => addItem(item.id, 1)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-500">
                            Không tìm thấy sản phẩm phù hợp với tiêu chí lọc.
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            pageSize={pageSize}
                            onPageChange={page => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProductPage;