import { useState, useEffect } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";

import {
  getAllCategories,
  softDeleteCategory,
} from "../../../services/category/category";

import type { CategoryRep } from "../../../services/category/category.type";

import { useExecute } from "../../../hooks/execute";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import AddCategory from "../../../components/add/category/add-category";
import EditCategory from "../../../components/edit/category/edit-category";

const AdminCategory = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [categories, setCategories] = useState<CategoryRep[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryRep[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [deletedCategories, setDeletedCategories] = useState<number>(0);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedCategoryIdForDelete, setSelectedCategoryIdForDelete] = useState<string | null>(null);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<CategoryRep | null>(null);

  const { query } = useExecute();
  const { showToast, showErrorResponse } = useToastContext();

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  //  FETCH 
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);

      const result = await query<CategoryRep[]>(getAllCategories());

      if (result?.errors) {
        showErrorResponse(result.errors);
      } else if (result?.data) {
        setCategories(result.data);
        setFilteredCategories(result.data);
        setTotalCategories(result.data.length);
        setDeletedCategories(result.data.filter(c => c.isDelete).length);
      }

      setLoading(false);
    };

    fetchCategories();
  }, []);

  //  FILTER 
  useEffect(() => {
    const filtered = categories.filter(category => {
      const matchSearch =
        category.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchInput.toLowerCase());

      const matchStatus =
        statusFilter === "" ||
        (statusFilter === "DELETED"
          ? category.isDelete
          : !category.isDelete);

      return matchSearch && matchStatus;
    });

    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchInput, statusFilter, categories]);

  //  DELETE 
const confirmDelete = async () => {
  if (!selectedCategoryIdForDelete) return;

  const result = await query(
    softDeleteCategory(selectedCategoryIdForDelete)
  );

  if (!result) {
    showToast("Error", "Không nhận được phản hồi từ server");
    return;
  }

  if (result.errors) {
    showErrorResponse(result.errors);
    return;
  }

  if (result.data) {
    showToast("Success", "Đã xóa danh mục");

    setCategories(prev =>
      prev.map(cat =>
        cat.id === selectedCategoryIdForDelete
          ? { ...cat, isDelete: true }
          : cat
      )
    );

    setDeletedCategories(prev => prev + 1);
  }

  setSelectedCategoryIdForDelete(null);
};

  //  ADD 
  const handleCategoryAdded = (newCategory: CategoryRep) => {
    setCategories(prev => [...prev, newCategory]);
    setTotalCategories(prev => prev + 1);
    setShowAddModal(false);
  };

  //  FORMAT DATE 
  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("vi-VN").format(dateObj);
  };

  //  TABLE 
  const tableHead: TableHeader = [
    "# ID",
    "Name",
    "Slug",
    "Status",
    "Create date",
    "Actions",
  ];

  const tableBody: TableBody = currentCategories.map(category => ([
    {
      reactNode: (
        <div className="max-w-[160px] truncate" title={category.id}>
          {category.id}
        </div>
      ),
      clipboard: category.id
    },
    category.name,
    category.slug,
    {
      reactNode: (
        <span
          onClick={() =>
            !category.isDelete &&
            setSelectedCategoryIdForDelete(category.id)
          }
          className={`px-2 py-1 rounded cursor-pointer ${
            category.isDelete
              ? "text-red-600 bg-red-100"
              : "text-green-600 bg-green-100"
          }`}
        >
          {category.isDelete ? "Đã xóa" : "Hoạt động"}
        </span>
      ),
    },
    formatDate(category.createdAt),
    {
      reactNode: (
        <div className="flex gap-2">
            {!category.isDelete && (
          <button
            onClick={() => setSelectedCategoryForEdit(category)}
            className="px-2 py-1 text-xs rounded ring-1 ring-gray-300 hover:bg-gray-50"
          >
            Sửa
          </button>
            )}
          {!category.isDelete && (
            <button
              onClick={() => setSelectedCategoryIdForDelete(category.id)}
              className="px-2 py-1 text-xs rounded ring-1 ring-red-300 text-red-600 hover:bg-red-50"
            >
              Xóa
            </button>
          )}
        </div>
      ),
    },
  ]));

  return (
    <div className="px-8 pt-5 space-y-5">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-blue-700 text-2xl font-semibold">
            Category management
          </h1>
          <p className="text-gray-500 text-sm">
            Quản lý danh mục sản phẩm
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring-2 text-sm ring-gray-300">
            <i className="fa-solid fa-arrow-up-from-bracket"></i>
            <span>Xuất file</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm ring-2 ring-blue-600 hover:bg-white hover:text-blue-600 transition"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-5 gap-5">
        <Stats
          icon={<i className="fa-regular fa-rectangle-list"></i>}
          title="Tổng danh mục"
          des={`${totalCategories} danh mục`}
        />

        <Stats
          icon={<i className="fa-solid fa-trash"></i>}
          iconColor="text-red-600"
          iconBg="bg-red-100"
          title="Danh mục đã xóa"
          des={`${deletedCategories} danh mục`}
        />
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <InputSearch
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            opts={{ width: "w-74" }}
          />

          <div className="ring-1 rounded py-1 px-2 ring-gray-300 w-60">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-sm py-1"
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="DELETED">Đã xóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
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

      {/* MODALS */}
      {showAddModal && (
        <AddCategory
          onCategoryAdded={handleCategoryAdded}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {selectedCategoryForEdit && (
        <EditCategory
          category={selectedCategoryForEdit}
          onClose={() => setSelectedCategoryForEdit(null)}
          onUpdated={(updated) => {
            setCategories(prev =>
              prev.map(cat =>
                cat.id === updated.id ? updated : cat
              )
            );
            setSelectedCategoryForEdit(null);
          }}
        />
      )}

      {selectedCategoryIdForDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">
              Xác nhận xóa danh mục
            </h2>

            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa danh mục này?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedCategoryIdForDelete(null)}
                className="px-4 py-2 rounded ring-1 ring-gray-300 hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
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

export default AdminCategory;