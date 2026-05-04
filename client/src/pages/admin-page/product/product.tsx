import { useCallback, useEffect, useMemo, useState } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";
import AdminPagination, { PAGE_SIZES } from "../../../components/admin-pagination/admin-pagination";
import {
    getAllProducts,
    deleteProduct,
    reActivateProduct,
} from "../../../services/product/product";
import type { ProductRep } from "../../../services/product/product.type";
import AddProduct from "../../../components/add/product/add-product";
import EditProduct from "../../../components/edit/product/edit-product";
import { useExecute } from "../../../hooks/execute";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import { useModalConfirmContext } from "../../../contexts/modal-confirm/modal-confirm";

/* ─── Filter bar select style ─── */
const selCls = "text-sm text-gray-700 focus:outline-none bg-transparent w-full";
const wrapCls = "ring-1 ring-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-600";

const AdminProduct = () => {
    const { query, loading } = useExecute();
    const [products, setProducts] = useState<ProductRep[]>([]);

    /* ── Filter state ── */
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "active" | "deleted">("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "price_asc" | "price_desc" | "">("");

    /* ── Pagination state ── */
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    /* ── Modal state ── */
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProductForEdit, setSelectedProductForEdit] = useState<ProductRep | null>(null);

    const { showToast, showErrorResponse } = useToastContext();
    const { waitConfirm } = useModalConfirmContext();

    /* ── Fetch ── */
    const fetchProducts = useCallback(async () => {
        const response = await query(getAllProducts({ page: 1, pageSize: 999 }));
        if (response?.data) {
            const pageData = response.data as any;
            setProducts(Array.isArray(pageData) ? pageData : (pageData.data ?? []));
        } else {
            setProducts([]);
        }
    }, []);

    useEffect(() => { void fetchProducts(); }, [fetchProducts]);

    /* ── Stats ── */
    const stats = useMemo(() => {
        const total = products.length;
        const deleted = products.filter(p => p.isDelete).length;
        return { total, active: total - deleted, deleted };
    }, [products]);

    /* ── Category options ── */
    const categoryOptions = useMemo(() => {
        const map = new Map<string, string>();
        products.forEach(p => {
            if (p.category?.id && p.category?.name) map.set(p.category.id, p.category.name);
        });
        return Array.from(map.entries()); // [id, name]
    }, [products]);

    /* ── Filtered + sorted + paginated ── */
    const filteredProducts = useMemo(() => {
        let list = products;

        // Search
        if (searchInput) {
            const kw = searchInput.toLowerCase();
            list = list.filter(p =>
                (p.id ?? "").toLowerCase().includes(kw) ||
                (p.property?.name ?? "").toLowerCase().includes(kw) ||
                (p.category?.name ?? "").toLowerCase().includes(kw)
            );
        }

        // Status
        if (statusFilter === "active") list = list.filter(p => !p.isDelete);
        else if (statusFilter === "deleted") list = list.filter(p => p.isDelete);

        // Category
        if (categoryFilter) list = list.filter(p => p.category?.id === categoryFilter);

        // Price range
        const min = priceMin ? Number(priceMin) : null;
        const max = priceMax ? Number(priceMax) : null;
        if (min !== null) list = list.filter(p => (p.property?.price ?? 0) >= min);
        if (max !== null) list = list.filter(p => (p.property?.price ?? 0) <= max);

        // Sort
        if (sortBy === "name") list = [...list].sort((a, b) =>
            (a.property?.name ?? "").localeCompare(b.property?.name ?? ""));
        else if (sortBy === "price_asc") list = [...list].sort((a, b) =>
            (a.property?.price ?? 0) - (b.property?.price ?? 0));
        else if (sortBy === "price_desc") list = [...list].sort((a, b) =>
            (b.property?.price ?? 0) - (a.property?.price ?? 0));

        return list;
    }, [products, searchInput, statusFilter, categoryFilter, priceMin, priceMax, sortBy]);

    /* ── Pagination ── */
    const totalPages = Math.max(Math.ceil(filteredProducts.length / pageSize), 1);
    const paginated = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

    // Reset to page 1 whenever filters change
    useEffect(() => { setPage(1); }, [searchInput, statusFilter, categoryFilter, priceMin, priceMax, sortBy]);

    const hasFilters = !!(searchInput || statusFilter || categoryFilter || priceMin || priceMax || sortBy);

    const clearFilters = () => {
        setSearchInput("");
        setStatusFilter("");
        setCategoryFilter("");
        setPriceMin("");
        setPriceMax("");
        setSortBy("");
    };

    /* ── Actions ── */
    const handleDeleteProduct = async (id: string) => {
        if (!id) return;
        const ok = await waitConfirm();
        if (!ok) return;
        const result = await query<ProductRep>(deleteProduct(id));
        if (!result) return;
        if (result.errors) showErrorResponse(result.errors);
        else {
            showToast("Success", "Đã xóa sản phẩm");
            setProducts(prev => prev.map(p => p.id === id ? { ...p, isDelete: true } : p));
        }
    };

    const handleReActivateProduct = async (id: string) => {
        if (!id) return;
        const ok = await waitConfirm();
        if (!ok) return;
        const result = await query<ProductRep>(reActivateProduct(id));
        if (!result) return;
        if (result.errors) showErrorResponse(result.errors);
        else {
            showToast("Success", "Đã khôi phục sản phẩm");
            setProducts(prev => prev.map(p => p.id === id ? { ...p, isDelete: false } : p));
        }
    };

    /* ── Table ── */
    const tableHead: TableHeader = [
        "# ID", "Ảnh", "Tên sản phẩm", "Danh mục", "Giá", "Kích thước", "Đơn vị", "Trạng thái", "Thao tác",
    ];

    const tableBody: TableBody = paginated.map(product => [
        { reactNode: <div className="max-w-36 truncate text-xs font-mono" title={product.id}>{product.id}</div>, clipboard: product.id },
        {
            reactNode: product.property?.urlImage ? (
                <img src={product.property.urlImage} className="w-11 h-11 object-cover rounded-lg border border-gray-100" />
            ) : (
                <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                    <i className="fa-solid fa-image text-sm" />
                </div>
            ),
        },
        { reactNode: <div className="max-w-48 truncate text-sm font-medium" title={product.property?.name ?? ""}>{product.property?.name ?? "—"}</div> },
        { reactNode: <div className="max-w-36 truncate text-xs text-gray-500" title={product.category?.name ?? ""}>{product.category?.name ?? "—"}</div> },
        {
            reactNode: (
                <span className="text-sm font-semibold text-gray-800">
                    {product.property?.price !== undefined ? product.property.price.toLocaleString("vi-VN") + " đ" : "—"}
                </span>
            )
        },
        product.property
            ? `${product.property.length ?? 0}×${product.property.width ?? 0}×${product.property.height ?? 0}`
            : "—",
        product.property?.unit ?? "—",
        {
            reactNode: (
                <span className={`px-2 py-1 rounded text-xs font-medium ${product.isDelete ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100"}`}>
                    {product.isDelete ? "Đã xóa" : "Hoạt động"}
                </span>
            )
        },
        {
            reactNode: (
                <div className="flex items-center gap-1.5">
                    {!product.isDelete && (
                        <button onClick={() => setSelectedProductForEdit(product)}
                            className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
                            Sửa
                        </button>
                    )}
                    {product.isDelete ? (
                        <button onClick={() => handleReActivateProduct(product.id)}
                            className="px-2 py-1 text-xs rounded border border-green-300 text-green-600 hover:bg-green-50">
                            Khôi phục
                        </button>
                    ) : (
                        <button onClick={() => handleDeleteProduct(product.id)}
                            className="px-2 py-1 text-xs rounded ring-1 ring-red-300 text-red-600 hover:bg-red-50">
                            Xóa
                        </button>
                    )}
                </div>
            ),
        },
    ]);

    return (
        <div className="px-8 pt-5 space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-blue-700 text-2xl font-semibold">Product management</h1>
                    <p className="text-gray-500 text-sm">Quản lý các sản phẩm có trong hệ thống</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm ring-2 ring-blue-600 hover:bg-white hover:text-blue-600 transition">
                        <i className="fa-solid fa-plus" />
                        <span>Thêm sản phẩm</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-5">
                <Stats icon={<i className="fa-regular fa-rectangle-list" />} title="Tổng sản phẩm" des={`${stats.total} sản phẩm`} />
                <Stats icon={<i className="fa-solid fa-check-circle" />} iconColor="text-green-600" iconBg="bg-green-100" title="Hoạt động" des={`${stats.active} sản phẩm`} />
                <Stats icon={<i className="fa-solid fa-trash" />} iconColor="text-red-600" iconBg="bg-red-100" title="Đã xóa" des={`${stats.deleted} sản phẩm`} />
            </div>

            {/* ── Filter panel ── */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                        <i className="fa-solid fa-sliders" />
                        Bộ lọc & Tìm kiếm
                    </p>
                    {hasFilters && (
                        <button onClick={clearFilters}
                            className="text-xs text-red-500 hover:text-red-700 underline flex items-center gap-1">
                            <i className="fa-solid fa-xmark" />
                            Xóa tất cả bộ lọc
                        </button>
                    )}
                </div>

                {/* Row 1: search + status + category */}
                <div className="flex flex-wrap gap-3 items-center">
                    <InputSearch searchInput={searchInput} setSearchInput={setSearchInput} opts={{ width: "w-72" }} />

                    {/* Status */}
                    <div className={wrapCls}>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className={selCls}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="deleted">Đã xóa</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div className={wrapCls}>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={selCls}>
                            <option value="">Tất cả danh mục</option>
                            {categoryOptions.map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <div className={wrapCls}>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className={selCls}>
                            <option value="">Sắp xếp mặc định</option>
                            <option value="name">Tên A → Z</option>
                            <option value="price_asc">Giá tăng dần</option>
                            <option value="price_desc">Giá giảm dần</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: price range */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">Giá từ:</span>
                        <input
                            type="number" min={0} value={priceMin}
                            onChange={e => setPriceMin(e.target.value)}
                            placeholder="0"
                            className="w-32 ring-1 ring-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">đến:</span>
                        <input
                            type="number" min={0} value={priceMax}
                            onChange={e => setPriceMax(e.target.value)}
                            placeholder="Không giới hạn"
                            className="w-40 ring-1 ring-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <span className="text-xs text-gray-500">đ</span>
                    </div>

                    {/* Active filters summary */}
                    {hasFilters && (
                        <div className="ml-auto flex flex-wrap gap-2">
                            {statusFilter && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">
                                    {statusFilter === "active" ? "Hoạt động" : "Đã xóa"}
                                    <button onClick={() => setStatusFilter("")} className="hover:text-red-500">×</button>
                                </span>
                            )}
                            {categoryFilter && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs">
                                    {categoryOptions.find(([id]) => id === categoryFilter)?.[1] ?? categoryFilter}
                                    <button onClick={() => setCategoryFilter("")} className="hover:text-red-500">×</button>
                                </span>
                            )}
                            {(priceMin || priceMax) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs">
                                    {priceMin ? Number(priceMin).toLocaleString("vi-VN") : "0"} — {priceMax ? Number(priceMax).toLocaleString("vi-VN") : "∞"} đ
                                    <button onClick={() => { setPriceMin(""); setPriceMax(""); }} className="hover:text-red-500">×</button>
                                </span>
                            )}
                            {sortBy && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                                    {sortBy === "name" ? "Tên A→Z" : sortBy === "price_asc" ? "Giá ↑" : "Giá ↓"}
                                    <button onClick={() => setSortBy("")} className="hover:text-red-500">×</button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm">
                    <i className="fa-solid fa-box-open text-3xl mb-3 block" />
                    Không tìm thấy sản phẩm phù hợp
                </div>
            ) : (
                <>
                    <Table tableHead={tableHead} tableBody={tableBody} />
                    <AdminPagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        pageSize={pageSize}
                        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
                        total={filteredProducts.length}
                    />
                </>
            )}

            {/* Modals */}
            {showAddModal && (
                <AddProduct
                    onClose={() => setShowAddModal(false)}
                    onProductAdded={() => { fetchProducts(); setShowAddModal(false); }}
                />
            )}
            {selectedProductForEdit && (
                <EditProduct
                    product={selectedProductForEdit}
                    onClose={() => setSelectedProductForEdit(null)}
                    onUpdated={(updated: ProductRep) => {
                        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                        setSelectedProductForEdit(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminProduct;