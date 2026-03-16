import { useState } from "react";
import { useExecute } from "../../../hooks/execute";
import {createCategory,type CategoryRep,type CreateCategoryForm,} from "../../../services/category";
import ButtonForm from "../../button/button-form/button-form";
import { useToastContext } from "../../../contexts/toast-message/toast-message";

interface AddCategoryProps {
  onCategoryAdded?: (category: CategoryRep) => void;
  onClose?: () => void;
}

const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const AddCategory = ({ onCategoryAdded, onClose }: AddCategoryProps) => {
  const { query, loading } = useExecute();
  const { showToast, showErrorResponse } = useToastContext();

  const [categoryForm, setCategoryForm] = useState<CreateCategoryForm>({
    name: "",
    slug: "",
    status: "Active",
  });

  const submitForm = async () => {
    if (!categoryForm.name.trim()) {
      showToast("Error", "Tên danh mục không được để trống!");
      return;
    }

    const result = await query<CategoryRep>(
      createCategory(categoryForm)
    );

    if (result?.errors) {
      showErrorResponse(result.errors);
    } else if (result?.data) {
      showToast("Success", "Thêm danh mục thành công!");

      onCategoryAdded?.(result.data);

      // Reset form
      setCategoryForm({
        name: "",
        slug: "",
        status: "",
      });

      setTimeout(() => {
        onClose?.();
      }, 500);
    }
  };

  return (
    <div className="fixed top-0 start-0 bg-gray-800/60 w-full h-screen flex items-center justify-center px-2 md:px-0 z-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
          <h1 className="text-lg font-semibold text-blue-700">
            Thêm danh mục mới
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-4">

          {/* NAME */}
          <div className="flex flex-col gap-1">
            <label className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
              Tên danh mục
            </label>
            <div className="px-3 ring-2 ring-gray-400 rounded-lg focus-within:ring-blue-700 flex items-center">
              <i className="fa-solid fa-tag text-gray-600"></i>
              <input
                type="text"
                className="none-input ps-2 py-2 w-full"
                placeholder="Ví dụ: Laptop Gaming"
                value={categoryForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCategoryForm({
                    ...categoryForm,
                    name,
                    slug: toSlug(name), // auto slug
                  });
                }}
              />
            </div>
          </div>

          {/* SLUG */}
          <div className="flex flex-col gap-1">
            <label className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
              Slug
            </label>
            <div className="px-3 ring-2 ring-gray-400 rounded-lg focus-within:ring-blue-700 flex items-center">
              <i className="fa-solid fa-link text-gray-600"></i>
              <input
                type="text"
                className="none-input ps-2 py-2 w-full"
                value={categoryForm.slug}
                disabled //auto
              />
            </div>
          </div>



        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-300 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white ring-1 ring-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Hủy bỏ
          </button>

          <ButtonForm
            className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={submitForm}
            inLoading={{
              isLoading: loading,
              textLoading: "Đang thêm...",
            }}
          >
            Thêm danh mục
          </ButtonForm>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;