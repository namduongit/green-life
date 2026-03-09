import { useEffect, useState } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";

import {
    getAllProducts,
    deleteProduct,
} from "../../../services/product/product";

import type { ProductRep } from "../../../services/product/product.type";

import AddProduct from "../../../components/add/product/add-product";
import EditProduct from "../../../components/edit/product/edit-product";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import { useModalConfirmContext } from "../../../contexts/modal-confirm/modal-confirm";
import { useExecute } from "../../../hooks/execute";

const AdminProduct = () => {
    const [products, setProducts] = useState<ProductRep[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductRep[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProductForEdit, setSelectedProductForEdit] =
        useState<ProductRep | null>(null);
    const [selectedProductIdForDelete, setSelectedProductIdForDelete] =
        useState<string | null>(null);

    const [totalProducts, setTotalProducts] = useState(0);
    const [deletedProducts, setDeletedProducts] = useState(0);
    const { showToast, showErrorResponse } = useToastContext();
    const { waitConfirm } = useModalConfirmContext();
    const { query } = useExecute();

    // FETCH
    const fetchProducts = async () => {
        setLoading(true);
        const result = await query<ProductRep[]>(getAllProducts());
        if (result?.errors) {
            showErrorResponse(result.errors);
        } else if (result?.data) {
            console.log("Fetched products:", result.data);
            const data: ProductRep[] = Array.isArray(result.data)
                ? result.data
                :  [];

            setProducts(data);
            setFilteredProducts(data);
            setTotalProducts(data.length);
            setDeletedProducts(data.filter(p => p.isDelete).length);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // SEARCH
    useEffect(() => {
        const filtered = products.filter(product => {
            const id = product.id ?? "";
            const name = product.property?.name ?? "";
            const category = product.category?.name ?? "";

            return (
                id.toLowerCase().includes(searchInput.toLowerCase()) ||
                name.toLowerCase().includes(searchInput.toLowerCase()) ||
                category.toLowerCase().includes(searchInput.toLowerCase())
            );
        });

        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [searchInput, products]);

    // DELETE
    const confirmDelete = async () => {
        if (!selectedProductIdForDelete) return;

        const confirm = await waitConfirm();
        if (!confirm) return;

        const result = await query(deleteProduct(selectedProductIdForDelete));

        if (result?.errors) {
            showErrorResponse(result.errors);
        } else if (result?.data) {
            showToast("Success", "Đã xóa sản phẩm");

            setProducts(prev =>
                prev.map(p =>
                    p.id === selectedProductIdForDelete
                        ? { ...p, isDelete: true }
                        : p
                )
            );

            setFilteredProducts(prev =>
                prev.map(p =>
                    p.id === selectedProductIdForDelete
                        ? { ...p, isDelete: true }
                        : p
                )
            );

            setDeletedProducts(prev => prev + 1);
        }

        setSelectedProductIdForDelete(null);
    };

    // PAGINATION
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // TABLE
    const tableHead: TableHeader = [
        "ID",
        "Image",
        "Name",
        "Category",
        "Stock",
        "Price",
        "Size",
        "Unit",
        "Status",
        "Actions",
    ];

    const tableBody: TableBody = currentProducts.map(product => [
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

        String(product.currentStock ?? 0),

        product.property?.price !== undefined
            ? product.property.price.toLocaleString("vi-VN") + " đ"
            : "0 đ",

        product.property
            ? `${product.property.length ?? 0} x ${product.property.width ?? 0} x ${product.property.height ?? 0}`
            : "N/A",

        product.property?.unit ?? "N/A",

        {
            reactNode: (
                <span
                    className={`px-2 py-1 rounded ${product.isDelete
                        ? "text-gray-600 bg-gray-100"
                        : product.status === "Active"
                            ? "text-green-600 bg-green-100"
                            : "text-yellow-600 bg-yellow-100"
                        }`}
                >
                    {product.isDelete ? "Đã xóa" : product.status}
                </span>
            )
        },

        {
            reactNode: (
                <div className="flex gap-2">
                    {!product.isDelete && (
                        <>
                            <button
                                onClick={() => setSelectedProductForEdit(product)}
                                className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                            >
                                Sửa
                            </button>

                            <button
                                onClick={() =>
                                    setSelectedProductIdForDelete(product.id)
                                }
                                className="px-2 py-1 text-xs rounded border ring-red-300 text-red-600 hover:bg-red-50"
                            >
                                Xóa
                            </button>
                        </>
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
                    des={`${totalProducts} sản phẩm`}
                />
                <Stats
                    icon={<i className="fa-solid fa-trash"></i>}
                    iconColor="text-red-600"
                    iconBg="bg-red-100"
                    title="Đã xóa"
                    des={`${deletedProducts} sản phẩm`}
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

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    <Table tableHead={tableHead} tableBody={tableBody} />

                    <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500">
                            Trang {currentPage} / {totalPages || 1}
                        </span>

                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-3 py-1 text-sm rounded ring-1 ring-gray-300 disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-3 py-1 text-sm rounded ring-1 ring-gray-300 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

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

                        setFilteredProducts(prev =>
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