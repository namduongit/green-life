import { useCallback, useEffect, useState } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";
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

const AdminProduct = () => {
    const { query, loading } = useExecute();
    const [products, setProducts] = useState<ProductRep[]>([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        deletedProducts: 0,
    });

    const [searchInput, setSearchInput] = useState<string>("");
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [selectedProductForEdit, setSelectedProductForEdit] = useState<ProductRep | null>(null);

    const { showToast, showErrorResponse } = useToastContext();
    const { waitConfirm } = useModalConfirmContext();

    const fetchProducts = useCallback(async () => {
        const response = await query<ProductRep[]>(getAllProducts());
        if (response && response.data) {
            const data = Array.isArray(response.data) ? response.data : [];
            setProducts(data);
        } else {
            setProducts([]);
        }
    }, []);

    useEffect(() => {
        void fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const total = products.length;
        const deleted = products.filter(p => p.isDelete).length;
        const active = total - deleted;
        setStats({
            totalProducts: total,
            activeProducts: active,
            deletedProducts: deleted,
        });
    }, [products]);

    const filteredProducts = Array.isArray(products) ? products.filter(product => {
        const id = product.id ?? "";
        const name = product.property?.name ?? "";
        const category = product.category?.name ?? "";

        return (
            id.toLowerCase().includes(searchInput.toLowerCase()) ||
            name.toLowerCase().includes(searchInput.toLowerCase()) ||
            category.toLowerCase().includes(searchInput.toLowerCase())
        );
    }) : [];

    const handleDeleteProduct = async (id: string) => {
        if (!id) return;

        const confirm = await waitConfirm();
        if (!confirm) return;

        const result = await query<ProductRep>(deleteProduct(id));

        if (!result) return;

        if (result.errors) {
            showErrorResponse(result.errors);
        } else {
            showToast("Success", "Đã xóa sản phẩm");
            setProducts(prev =>
                prev.map(p =>
                    p.id === id ? { ...p, isDelete: true } : p
                )
            );
        }
    };

    const handleReActivateProduct = async (id: string) => {
        if (!id) return;

        const confirm = await waitConfirm();
        if (!confirm) return;

        const result = await query<ProductRep>(reActivateProduct(id));

        if (!result) return;

        if (result.errors) {
            showErrorResponse(result.errors);
        } else {
            showToast("Success", "Đã mở khóa sản phẩm");
            setProducts(prev =>
                prev.map(p =>
                    p.id === id ? { ...p, isDelete: false } : p
                )
            );
        }
    };



    const tableHead: TableHeader = [
        "ID",
        "Image",
        "Name",
        "Category",
        "Price",
        "Size",
        "Unit",
        "Status",
        "Actions",
    ];

    const tableBody: TableBody = filteredProducts.map(product => [
        {
            reactNode: (
                <div
                    className="max-w-45 truncate"
                    title={product.id}
                >
                    {product.id}
                </div>
            ),
            clipboard: product.id
        },
        {
            reactNode: product.property?.urlImage ? (
                <img
                    src={product.property.urlImage}
                    className="w-12 h-12 object-cover rounded"
                />
            ) : (
                "N/A"
            ),
        },
        {
            reactNode: (
                <div
                    className="max-w-50 truncate"
                    title={product.property?.name ?? "N/A"}
                >
                    {product.property?.name ?? "N/A"}
                </div>
            )
        },
        {
            reactNode: (
                <div
                    className="max-w-45 truncate"
                    title={product.category?.name ?? "N/A"}
                >
                    {product.category?.name ?? "N/A"}
                </div>
            )
        },
        product.property?.price !== undefined
            ? product.property.price.toLocaleString("vi-VN") + " đ"
            : "0 đ",
        product.property
            ? `${product.property.length ?? 0} x ${product.property.width ?? 0} x ${product.property.height ?? 0}`
            : "N/A",
        product.property?.unit ?? "N/A",
        {
            reactNode: (
                <div
                    onClick={() =>
                        product.isDelete
                            ? handleReActivateProduct(product.id)
                            : handleDeleteProduct(product.id)
                    }
                    className="cursor-pointer"
                >
                    <span
                        className={`px-2 py-1 rounded ${
                            product.isDelete
                                ? "text-red-600 bg-red-100"
                                : "text-green-600 bg-green-100"
                        }`}
                    >
                        {product.isDelete ? "Đã xóa" : "Hoạt động"}
                    </span>
                </div>
            )
        },
        {
            reactNode: (
                <div className="flex items-center gap-2">
                    {!product.isDelete && (
                        <button
                            onClick={() => setSelectedProductForEdit(product)}
                            className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                        >
                            Sửa
                        </button>
                    )}
                    {product.isDelete ? (
                        <button
                            onClick={() => handleReActivateProduct(product.id)}
                            className="px-2 py-1 text-xs rounded border border-green-300 text-green-600 hover:bg-green-50"
                        >
                            Khôi phục
                        </button>
                    ) : (
                        <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="px-2 py-1 text-xs rounded ring-1 ring-red-300 text-red-600 hover:bg-red-50"
                        >
                            Xóa
                        </button>
                    )}
                </div>
            ),
        },
    ]);

    return (
        <div className="px-8 pt-5 space-y-5">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-blue-700 text-2xl font-semibold">Product management</h1>
                    <p className="text-gray-500 text-sm">Quản lý các sản phẩm có trong hệ thống</p>
                </div>

                <div className="flex gap-3 items-center">
                    <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring-2 
                            text-sm ring-gray-300">
                        <i className="fa-solid fa-arrow-up-from-bracket"></i>
                        <span>Xuất file</span>
                    </button>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded
                            text-sm ring-2 ring-blue-600 hover:bg-white hover:text-blue-600 transition">
                        <i className="fa-solid fa-plus"></i>
                        <span>Thêm sản phẩm</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-5">
                <Stats
                    icon={<i className="fa-regular fa-rectangle-list"></i>}
                    title="Tổng sản phẩm"
                    des={`${stats.totalProducts} sản phẩm`}
                />
                <Stats
                    icon={<i className="fa-solid fa-check-circle"></i>}
                    iconColor="text-green-600"
                    iconBg="bg-green-100"
                    title="Sản phẩm hoạt động"
                    des={`${stats.activeProducts} sản phẩm`}
                />
                <Stats
                    icon={<i className="fa-solid fa-trash"></i>}
                    iconColor="text-red-600"
                    iconBg="bg-red-100"
                    title="Đã xóa"
                    des={`${stats.deletedProducts} sản phẩm`}
                />
            </div>

            <div className="flex justify-between items-center">
                <InputSearch
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    opts={{ width: "w-74" }}
                />

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring 
                                text-sm ring-gray-300">
                        <i className="fa-solid fa-arrow-down-wide-short"></i>
                        <span>Bộ lọc</span>
                    </button>

                    <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring 
                                text-sm ring-gray-300">
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </div>
            </div>

            <div>
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        <Table
                            tableHead={tableHead}
                            tableBody={tableBody}
                        />
                    </>
                )}
            </div>

            {showAddModal && (
                <AddProduct
                    onClose={() => setShowAddModal(false)}
                    onProductAdded={() => {
                        fetchProducts();
                        setShowAddModal(false);
                    }}
                />
            )}

            {selectedProductForEdit && (
                <EditProduct
                    product={selectedProductForEdit}
                    onClose={() => setSelectedProductForEdit(null)}
                    onUpdated={(updated: ProductRep) => {
                        setProducts(prev =>
                            prev.map(p =>
                                p.id === updated.id ? updated : p
                            )
                        );

                        setSelectedProductForEdit(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminProduct;