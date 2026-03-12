import { useState } from "react";
import { useExecute } from "../../../hooks/execute";
import { createTag } from "../../../services/tag/tag";
import {
  type TagRep,
  type CreateTagForm,
} from "../../../services/tag/tag.type";
import ButtonForm from "../../button/button-form/button-form";
import { useToastContext } from "../../../contexts/toast-message/toast-message";

interface AddTagProps {
  onTagAdded?: (tag: TagRep) => void;
  onClose?: () => void;
}

const AddTag = ({ onTagAdded, onClose }: AddTagProps) => {
  const { query, loading } = useExecute();
  const { showToast, showErrorResponse } = useToastContext();

  const [tagForm, setTagForm] = useState<CreateTagForm>({
    name: "",
    status: "Active",
  });

  const submitForm = async () => {
    if (!tagForm.name.trim()) {
      showToast("Error", "Tên tag không được để trống!");
      return;
    }

    const result = await query<TagRep>(
      createTag(tagForm)
    );

    if (result?.errors) {
      showErrorResponse(result.errors);
    } else if (result?.data) {
      showToast("Success", "Thêm tag thành công!");

      onTagAdded?.(result.data);

      // Reset form
      setTagForm({
        name: "",
        status: "Active",
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
            Thêm tag mới
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
              Tên tag
            </label>
            <div className="px-3 ring-2 ring-gray-400 rounded-lg focus-within:ring-blue-700 flex items-center">
              <i className="fa-solid fa-tags text-gray-600"></i>
              <input
                type="text"
                className="none-input ps-2 py-2 w-full"
                placeholder="Ví dụ: Gaming, Văn phòng..."
                value={tagForm.name}
                onChange={(e) =>
                  setTagForm({
                    ...tagForm,
                    name: e.target.value,
                  })
                }
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
            Thêm tag
          </ButtonForm>
        </div>
      </div>
    </div>
  );
};

export default AddTag;