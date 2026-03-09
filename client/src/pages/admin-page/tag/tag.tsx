import { useState, useEffect } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";

import {
  getAllTags,
  softDeleteTag,
} from "../../../services/tag/tag";

import type { TagRep } from "../../../services/tag/tag.type";

import { useExecute } from "../../../hooks/execute";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import AddTag from "../../../components/add/tag/add-tag";
import EditTag from "../../../components/edit/tag/edit-tag";

const AdminTag = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [tags, setTags] = useState<TagRep[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagRep[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [totalTags, setTotalTags] = useState<number>(0);
  const [deletedTags, setDeletedTags] = useState<number>(0);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedTagIdForDelete, setSelectedTagIdForDelete] =
    useState<string | null>(null);
  const [selectedTagForEdit, setSelectedTagForEdit] =
    useState<TagRep | null>(null);

  const { query } = useExecute();
  const { showToast, showErrorResponse } = useToastContext();

  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentTags = filteredTags.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // FETCH
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);

      const result = await query<TagRep[]>(getAllTags());

      if (result?.errors) {
        showErrorResponse(result.errors);
      } else if (result?.data) {
        setTags(result.data);
        setFilteredTags(result.data);
        setTotalTags(result.data.length);
        setDeletedTags(result.data.filter(t => t.isDelete).length);
      }

      setLoading(false);
    };

    fetchTags();
  }, []);

  // FILTER
  useEffect(() => {
    const filtered = tags.filter(tag => {
      const matchSearch =
        tag.name.toLowerCase().includes(searchInput.toLowerCase());

      const matchStatus =
        statusFilter === "" ||
        (statusFilter === "DELETED"
          ? tag.isDelete
          : !tag.isDelete);

      return matchSearch && matchStatus;
    });

    setFilteredTags(filtered);
    setCurrentPage(1);
  }, [searchInput, statusFilter, tags]);

  // DELETE
  const confirmDelete = async () => {
    if (!selectedTagIdForDelete) return;

    const result = await query(
      softDeleteTag(selectedTagIdForDelete)
    );

    if (result?.errors) {
      showErrorResponse(result.errors);
    } else {
      showToast("Success", "Đã xóa tag");

      setTags(prev =>
        prev.map(tag =>
          tag.id === selectedTagIdForDelete
            ? { ...tag, isDelete: true }
            : tag
        )
      );

      setDeletedTags(prev => prev + 1);
    }

    setSelectedTagIdForDelete(null);
  };

  // ADD
  const handleTagAdded = (newTag: TagRep) => {
    setTags(prev => [...prev, newTag]);
    setTotalTags(prev => prev + 1);
    setShowAddModal(false);
  };

  // FORMAT DATE
  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("vi-VN").format(dateObj);
  };

  // TABLE
  const tableHead: TableHeader = [
    "# ID",
    "Name",
    "Status",
    "Create date",
    "Actions",
  ];

  const tableBody: TableBody = currentTags.map(tag => ([
    {
      reactNode: (
        <div className="max-w-[160px] truncate" title={tag.id}>
          {tag.id}
        </div>
      ),
      clipboard: tag.id
    },
    tag.name,
    {
      reactNode: (
        <span
          onClick={() =>
            !tag.isDelete &&
            setSelectedTagIdForDelete(tag.id)
          }
          className={`px-2 py-1 rounded cursor-pointer ${
            tag.isDelete
              ? "text-red-600 bg-red-100"
              : "text-green-600 bg-green-100"
          }`}
        >
          {tag.isDelete ? "Đã xóa" : "Hoạt động"}
        </span>
      ),
    },
    formatDate(tag.createdAt),
    {
      reactNode: (
        <div className="flex gap-2">
          {!tag.isDelete && (
            <button
              onClick={() => setSelectedTagForEdit(tag)}
              className="px-2 py-1 text-xs rounded ring-1 ring-gray-300 hover:bg-gray-50"
            >
              Sửa
            </button>
          )}

          {!tag.isDelete && (
            <button
              onClick={() =>
                setSelectedTagIdForDelete(tag.id)
              }
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
            Tag management
          </h1>
          <p className="text-gray-500 text-sm">
            Quản lý tag sản phẩm
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm ring-2 ring-blue-600 hover:bg-white hover:text-blue-600 transition"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Thêm tag</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-5 gap-5">
        <Stats
          icon={<i className="fa-solid fa-tags"></i>}
          title="Tổng tag"
          des={`${totalTags} tag`}
        />

        <Stats
          icon={<i className="fa-solid fa-trash"></i>}
          iconColor="text-red-600"
          iconBg="bg-red-100"
          title="Tag đã xóa"
          des={`${deletedTags} tag`}
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
        <AddTag
          onTagAdded={handleTagAdded}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {selectedTagForEdit && (
        <EditTag
          tag={selectedTagForEdit}
          onClose={() => setSelectedTagForEdit(null)}
          onUpdated={(updated) => {
            setTags(prev =>
              prev.map(tag =>
                tag.id === updated.id ? updated : tag
              )
            );
            setSelectedTagForEdit(null);
          }}
        />
      )}

      {selectedTagIdForDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">
              Xác nhận xóa tag
            </h2>

            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa tag này?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedTagIdForDelete(null)}
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

export default AdminTag;