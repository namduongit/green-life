import { useCallback, useEffect, useMemo, useState } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";
import AdminPagination, { PAGE_SIZES } from "../../../components/admin-pagination/admin-pagination";
import {
  getAllCategories,
  softDeleteCategory,
  reActivateCategory
} from "../../../services/category/category";
import type { CategoryRep } from "../../../services/category/category.type";
import { useExecute } from "../../../hooks/execute";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import AddCategory from "../../../components/add/category/add-category";
import EditCategory from "../../../components/edit/category/edit-category";

const AdminCategory = () => {
  const { query, loading } = useExecute();
  const [categories, setCategories] = useState<CategoryRep[]>([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    deletedCategories: 0,
  });

  const [searchInput, setSearchInput] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedCategoryIdForDelete, setSelectedCategoryIdForDelete] = useState<string | null>(null);
  const [selectedCategoryIdForRestore, setSelectedCategoryIdForRestore] = useState<string | null>(null);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<CategoryRep | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const { showToast, showErrorResponse } = useToastContext();

  const fetchCategories = useCallback(async () => {
    const result = await query<CategoryRep[]>(getAllCategories());

    if (result?.errors) {
      showErrorResponse(result.errors);
    } else if (result?.data) {
      const data = Array.isArray(result.data) ? result.data : [];
      setCategories(data);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const total = categories.length;
    const deleted = categories.filter(c => c.isDelete).length;
    setStats({
      totalCategories: total,
      deletedCategories: deleted,
    });
  }, [categories]);

  const filteredCategories = useMemo(() => categories.filter(category => {
    const matchSearch =
      category.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchInput.toLowerCase());
    const matchStatus =
      statusFilter === "" ||
      (statusFilter === "DELETED" ? category.isDelete : !category.isDelete);
    return matchSearch && matchStatus;
  }), [categories, searchInput, statusFilter]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [searchInput, statusFilter]);

  const handleReActivateCategory = async (id: string) => {
    const result = await query(reActivateCategory(id));

    if (!result) return;

    if (result.errors) {
      showErrorResponse(result.errors);
    } else if (result.data) {
      showToast("Success", "Đã mở khóa danh mục");
      setCategories(prev =>
        prev.map(cat =>
          cat.id === id ? { ...cat, isDelete: false } : cat
        )
      );
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const result = await query(softDeleteCategory(id));

    if (!result) return;

    if (result.errors) {
      showErrorResponse(result.errors);
    } else if (result.data) {
      showToast("Success", "Đã xóa danh mục");
      setCategories(prev =>
        prev.map(cat =>
          cat.id === id ? { ...cat, isDelete: true } : cat
        )
      );
    }

    setSelectedCategoryIdForDelete(null);
  };

  const handleCategoryAdded = (newCategory: CategoryRep) => {
    setCategories(prev => [...prev, newCategory]);
    setShowAddModal(false);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("vi-VN").format(dateObj);
  };

  const tableHead: TableHeader = [
    "# ID",
    "Name",
    "Slug",
    "Status",
    "Create date",
    "Actions",
  ];

  const tableBody: TableBody = paginatedCategories.map(category => ([
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
            category.isDelete
              ? setSelectedCategoryIdForRestore(category.id)
              : setSelectedCategoryIdForDelete(category.id)
          }
          className={`px-2 py-1 rounded cursor-pointer ${category.isDelete
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
        <div className="flex items-center gap-2">
          {!category.isDelete && (
            <button
              onClick={() => setSelectedCategoryForEdit(category)}
              className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
            >
              Sửa
            </button>
          )}

          {!category.isDelete ? (
            <button
              onClick={() => setSelectedCategoryIdForDelete(category.id)}
              className="px-2 py-1 text-xs rounded ring-1 ring-red-300 text-red-600 hover:bg-red-50"
            >
              Xóa
            </button>
          ) : (
            <button
              onClick={() => setSelectedCategoryIdForRestore(category.id)}
              className="px-2 py-1 text-xs rounded border border-green-300 text-green-600 hover:bg-green-50"
            >
              Khôi phục
            </button>
          )}
        </div>
      ),
    }
  ]));

  return (
    <div className="px-8 pt-5 space-y-5">
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

      <div className="grid grid-cols-5 gap-5">
        <Stats
          icon={<i className="fa-regular fa-rectangle-list"></i>}
          title="Tổng danh mục"
          des={`${stats.totalCategories} danh mục`}
        />

        <Stats
          icon={<i className="fa-solid fa-trash"></i>}
          iconColor="text-red-600"
          iconBg="bg-red-100"
          title="Danh mục đã xóa"
          des={`${stats.deletedCategories} danh mục`}
        />
      </div>

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
            <Table tableHead={tableHead} tableBody={tableBody} />
            <AdminPagination
              page={page} totalPages={Math.max(totalPages, 1)}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={s => { setPageSize(s); setPage(1); }}
              total={filteredCategories.length}
            />
          </>
        )}
      </div>

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
                onClick={() => handleDeleteCategory(selectedCategoryIdForDelete)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCategoryIdForRestore && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">
              Xác nhận khôi phục danh mục
            </h2>

            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn khôi phục danh mục này?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedCategoryIdForRestore(null)}
                className="px-4 py-2 rounded ring-1 ring-gray-300 hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                onClick={() => selectedCategoryIdForRestore && handleReActivateCategory(selectedCategoryIdForRestore)}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
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
