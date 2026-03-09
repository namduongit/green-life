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
    const { showToast } = useToastContext();

    // FETCH
    const fetchProducts = async () => {
        try {
            setLoading(true);

            const res = await getAllProducts();

            const data: ProductRep[] = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.data)
                    ? res.data.data
                    : [];

            setProducts(data);
            setFilteredProducts(data);
            setTotalProducts(data.length);
            setDeletedProducts(data.filter(p => p.isDelete).length);
        } catch (err) {
            console.error("Fetch error:", err);
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
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

        try {
            const response = await deleteProduct(selectedProductIdForDelete);

            if (response.status === 200 || response.status === 204) {
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
            } else {
                showToast("Error", "Xóa sản phẩm thất bại");
            }

        } catch (error) {
            console.error(error);
            showToast("Error", "Xóa sản phẩm thất bại");
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
        product.id,

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

        product.property?.name ?? "N/A",

        product.category?.name ?? "N/A",

        String(product.currentStock ?? 0),

        product.property?.price !== undefined
            ? product.property.price.toLocaleString("vi-VN") + " đ"
            : "0 đ",

        product.property
            ? `${product.property.length ?? 0} x ${product.property.width ?? 0} x ${product.property.height ?? 0}`
            : "N/A",

        product.property?.unit ?? "N/A",

        product.isDelete ? "Đã xóa" : product.status,

        {
            reactNode: (
                <div className="flex gap-2">
                    {!product.isDelete && (
                        <>
                            <button
                                onClick={() => setSelectedProductForEdit(product)}
                                className="px-2 py-1 text-xs rounded ring-1 ring-gray-300"
                            >
                                Sửa
                            </button>

                            <button
                                onClick={() =>
                                    setSelectedProductIdForDelete(product.id)
                                }
                                className="px-2 py-1 text-xs rounded ring-1 ring-red-300 text-red-600"
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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-blue-700">
                    Product Management
                </h1>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                    Thêm sản phẩm
                </button>
            </div>

            <div className="grid grid-cols-5 gap-5">
                <Stats
                    icon={<i className="fa-solid fa-box text-blue-500"></i>}
                    title="Tổng sản phẩm"
                    des={`${totalProducts} sản phẩm`}
                />
                <Stats
                    icon={<i className="fa-solid fa-trash text-red-500"></i>}
                    title="Đã xóa"
                    des={`${deletedProducts} sản phẩm`}
                />
            </div>

            <InputSearch
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                opts={{ width: "w-74" }}
            />

            {loading ? (
                <p className="text-center py-10">Đang tải dữ liệu...</p>
            ) : (
                <>
                    <Table tableHead={tableHead} tableBody={tableBody} />

                    <div className="flex justify-between mt-4">
                        <span>
                            Trang {currentPage} / {totalPages || 1}
                        </span>

                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-3 py-1 ring-1 rounded"
                            >
                                Previous
                            </button>

                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-3 py-1 ring-1 rounded"
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

            {selectedProductIdForDelete && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h2 className="mb-4 font-semibold">
                            Xác nhận xóa sản phẩm?
                        </h2>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedProductIdForDelete(null)}
                                className="px-4 py-2 ring-1 rounded"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProduct;