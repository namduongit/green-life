import { useState, useEffect } from "react";
import {
    updateProperty,
    updateCategory,
    updateTags,
    changeStock,
    updateStatus
} from "../../../services/product/product";
import { getAllCategories } from "../../../services/category/category";
import { getAllTags } from "../../../services/tag/tag";
import type { ProductRep, ProductStatus } from "../../../services/product/product.type";
import { useToastContext } from "../../../contexts/toast-message/toast-message";

interface Props {
    product: ProductRep;
    onUpdated?: (product: ProductRep) => void;
    onClose?: () => void;
}

type Category = {
    id: string;
    name: string;
};

type Tag = {
    id: string;
    name: string;
};

type FormState = {
    name: string;
    description: string;
    categoryId: string;
    price: string;
    currentStock: string;
    urlImage: string;
    weight: string;
    unit: string;
    length: string;
    width: string;
    height: string;
    status: ProductStatus;
    tags: string[];
};

const UNIT_OPTIONS = ["Gram", "Kilogram", "Other"] as const;

const EditProduct = ({ product, onUpdated, onClose }: Props) => {

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const { showToast, showErrorResponse } = useToastContext();
    const [previewImage, setPreviewImage] = useState<string>(
        product.property?.urlImage || ""
    );

    const [form, setForm] = useState<FormState>({
        name: product.property?.name || "",
        description: product.property?.description || "",
        categoryId: product.categoryId || "",
        price: String(product.property?.price ?? ""),
        currentStock: String(product.currentStock ?? ""),
        urlImage: product.property?.urlImage || "",
        weight: String(product.property?.weight ?? ""),
        unit: product.property?.unit || "",
        length: String(product.property?.length ?? ""),
        width: String(product.property?.width ?? ""),
        height: String(product.property?.height ?? ""),
        status: product.status,
        tags: product.tags?.map((tag: any) =>
            typeof tag === "string" ? tag : tag.id
        ) || [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cateRes = await getAllCategories();
                const tagRes = await getAllTags();

                const cateData = Array.isArray(cateRes.data)
                    ? cateRes.data
                    : cateRes.data?.data ?? [];

                const tagData = Array.isArray(tagRes.data)
                    ? tagRes.data
                    : tagRes.data?.data ?? [];

                setCategories(cateData);
                setTags(tagData);
            } catch (error) {
                console.error("Load data failed:", error);
                setCategories([]);
                setTags([]);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        setPreviewImage(form.urlImage);
    }, [form.urlImage]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim())
            newErrors.name = "Vui lòng nhập tên sản phẩm";

        if (!form.urlImage.trim())
            newErrors.urlImage = "Vui lòng nhập URL hình ảnh";

        if (!form.categoryId)
            newErrors.categoryId = "Vui lòng chọn danh mục";

        if (!form.price || Number(form.price) <= 0)
            newErrors.price = "Giá phải lớn hơn 0";

        if (form.currentStock && Number(form.currentStock) < 0)
            newErrors.currentStock = "Số lượng không hợp lệ";

        if (!form.weight || Number(form.weight) <= 0)
            newErrors.weight = "Trọng lượng phải lớn hơn 0";

        if (!form.unit)
            newErrors.unit = "Vui lòng nhập đơn vị";

        if (form.length && Number(form.length) < 0)
            newErrors.length = "Chiều dài không hợp lệ";

        if (form.width && Number(form.width) < 0)
            newErrors.width = "Chiều rộng không hợp lệ";

        if (form.height && Number(form.height) < 0)
            newErrors.height = "Chiều cao không hợp lệ";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toggleTag = (tagId: string) => {
        if (form.tags.includes(tagId)) {
            setForm({
                ...form,
                tags: form.tags.filter(id => id !== tagId),
            });
        } else {
            setForm({
                ...form,
                tags: [...form.tags, tagId],
            });
        }
    };



    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await updateProperty(product.id, {
                property: {
                    name: form.name,
                    urlImage: form.urlImage,
                    description: form.description,
                    weight: form.weight,
                    unit: form.unit,
                    length: Number(form.length || 0),
                    width: Number(form.width || 0),
                    height: Number(form.height || 0),
                }
            });

            if (form.categoryId !== product.categoryId) {
                await updateCategory(product.id, form.categoryId);
            }
            console.log("FORM TAGS:", form.tags);
            await updateTags(product.id, form.tags);
            await changeStock(product.id, Number(form.currentStock || 0));
            await updateStatus(product.id, form.status);

            onUpdated?.({
                ...product,
                currentStock: Number(form.currentStock),
                status: form.status,
                categoryId: form.categoryId,
                tags: form.tags,
            });
            showToast("Success", "Cập nhật sản phẩm thành công");
            onClose?.();
        } catch (err: any) {
            console.log("STATUS:", err.response?.status)
            console.log("DATA:", err.response?.data)
            console.log("FULL ERROR:", err)
            alert("Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field: string) =>
        `border p-2 w-full rounded ${errors[field] ? "border-red-500" : ""}`;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto space-y-5">

                <h2 className="text-lg font-semibold text-gray-800">
                    Chỉnh sửa sản phẩm
                </h2>

                <div className="space-y-4">

                    {/* NAME */}
                    <div>
                        <label className="block text-sm font-medium">
                            Tên sản phẩm *
                        </label>
                        <input
                            placeholder="VD: Chuột Gaming Razer Viper"
                            className={inputClass("name")}
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* IMAGE URL */}
                    <div>
                        <label className="block text-sm font-medium">
                            URL Hình ảnh sản phẩm
                        </label>

                        <input
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            className="border p-2 w-full rounded"
                            value={form.urlImage}
                            onChange={(e) =>
                                setForm({ ...form, urlImage: e.target.value })
                            }
                        />

                        {previewImage && (
                            <div className="mt-3">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded border"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* PRICE */}
                    <div>
                        <label className="block text-sm font-medium">
                            Giá bán (VND) *
                        </label>
                        <input
                            type="number"
                            placeholder="VD: 1500000"
                            className={inputClass("price")}
                            value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })}
                        />
                        {errors.price && (
                            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                        )}
                    </div>

                    {/* STOCK */}
                    <div>
                        <label className="block text-sm font-medium">
                            Số lượng tồn kho
                        </label>
                        <input
                            type="number"
                            placeholder="VD: 100"
                            className={inputClass("currentStock")}
                            value={form.currentStock}
                            onChange={e =>
                                setForm({ ...form, currentStock: e.target.value })
                            }
                        />
                        {errors.currentStock && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.currentStock}
                            </p>
                        )}
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label className="block text-sm font-medium">
                            Danh mục *
                        </label>
                        <select
                            className={inputClass("categoryId")}
                            value={form.categoryId}
                            onChange={e =>
                                setForm({ ...form, categoryId: e.target.value })
                            }
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.categoryId}
                            </p>
                        )}
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="block text-sm font-medium">
                            Trọng lượng
                        </label>
                        <input
                            type="number"
                            placeholder="VD: 100"
                            className={inputClass("weight")}
                            value={form.weight}
                            onChange={e =>
                                setForm({ ...form, weight: e.target.value })
                            }
                        />
                        {errors.weight && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.weight}
                            </p>
                        )}
                    </div>

                    {/* UNIT */}
                    <div>
                        <label className="block text-sm font-medium">
                            Đơn vị *
                        </label>
                        <select
                            className={inputClass("unit")}
                            value={form.unit}
                            onChange={e =>
                                setForm({ ...form, unit: e.target.value })
                            }
                        >
                            <option value="">-- Chọn đơn vị --</option>
                            {UNIT_OPTIONS.map(unit => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>
                        {errors.unit && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.unit}
                            </p>
                        )}
                    </div>

                </div>

                {/* THÔNG SỐ */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">
                        Thông số kỹ thuật
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="number"
                            placeholder="Chiều dài (cm)"
                            className={inputClass("length")}
                            value={form.length}
                            onChange={e =>
                                setForm({ ...form, length: e.target.value })
                            }
                        />
                        <input
                            type="number"
                            placeholder="Chiều rộng (cm)"
                            className={inputClass("width")}
                            value={form.width}
                            onChange={e =>
                                setForm({ ...form, width: e.target.value })
                            }
                        />
                        <input
                            type="number"
                            placeholder="Chiều cao (cm)"
                            className={inputClass("height")}
                            value={form.height}
                            onChange={e =>
                                setForm({ ...form, height: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* TAG */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Gắn Tag
                    </label>

                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                className={`px-3 py-1 text-sm rounded-full border transition ${form.tags.includes(tag.id)
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-gray-100"
                                    }`}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm border rounded"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
                    >
                        {loading ? "Đang lưu..." : "Cập nhật sản phẩm"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EditProduct;