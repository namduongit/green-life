import type { CategoryRep } from "../../../services/category";
import { useState, useEffect } from "react";
import { updateCategory } from "../../../services/category/category";
import { useToastContext } from "../../../contexts/toast-message/toast-message";

type Props = {
    category: CategoryRep;
    onClose: () => void;
    onUpdated: (updated: CategoryRep) => void;
};

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

const EditCategory = ({ category, onClose, onUpdated }: Props) => {
    const { showToast, showErrorResponse } = useToastContext();

    const [name, setName] = useState(category.name);
    const [status, setStatus] = useState(category.status);
    const [error, setError] = useState("");

    useEffect(() => {
        setName(category.name);
        setStatus(category.status);
        setError("");
    }, [category]);

    const generatedSlug = toSlug(name); // auto slug theo name

    const handleSubmit = async () => {
        setError("");

        if (!name.trim()) {
            setError("Tên danh mục không được để trống");
            return;
        }

        const payload = {
            name,
            slug: generatedSlug,
            status
        };

        const result = await updateCategory(category.id, payload);

        if (result?.data) {
            onUpdated({
                ...category,
                name,
                slug: generatedSlug,
                status
            });

            showToast("Success", "Cập nhật danh mục thành công");
            onClose();
        } else {
            showErrorResponse("Cập nhật thất bại");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded w-96">
                <h2 className="text-lg font-semibold mb-4">
                    Chỉnh sửa danh mục
                </h2>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên danh mục"
                    className="border p-2 w-full mb-3"
                />

                {/* preview slug */}
                <input
                    value={generatedSlug}
                    disabled
                    className="border p-2 w-full mb-3 bg-gray-100 text-gray-600 cursor-not-allowed"
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

export default EditCategory;