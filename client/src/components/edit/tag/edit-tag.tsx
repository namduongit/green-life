import type { TagRep } from "../../../services/tag/tag.type";
import { useState, useEffect } from "react";
import { updateTag } from "../../../services/tag/tag";
import { useToastContext } from "../../../contexts/toast-message/toast-message";

type Props = {
  tag: TagRep;
  onClose: () => void;
  onUpdated: (updated: TagRep) => void;
};

const EditTag = ({ tag, onClose, onUpdated }: Props) => {
  const { showToast, showErrorResponse } = useToastContext();

  const [name, setName] = useState(tag.name);
  const [status, setStatus] = useState(tag.status);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(tag.name);
    setStatus(tag.status);
    setError("");
  }, [tag]);

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError("Tên tag không được để trống");
      return;
    }

    const payload = {
      name,
      status,
    };

    const result = await updateTag(tag.id, payload);

    if (result?.data) {
      onUpdated({
        ...tag,
        name,
        status,
      });

      showToast("Success", "Cập nhật tag thành công");
      onClose();
    } else {
      showErrorResponse("Cập nhật thất bại");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-semibold mb-4">
          Chỉnh sửa tag
        </h2>

        {/* NAME */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên tag"
          className="border p-2 w-full mb-3"
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTag;