import { useState, useEffect } from "react";
import { createProduct } from "../../../services/product/product";
import { getAllCategories } from "../../../services/category/category";
import { getAllTags } from "../../../services/tag/tag";
import type { ProductRep } from "../../../services/product/product.type";
import { useToastContext } from "../../../contexts/toast-message/toast-message";

interface Props {
    onProductAdded?: (product: ProductRep) => void;
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
    status: string;
    tags: string[];
};

const UNIT_OPTIONS = ["Gram", "Kilogram", "Other"] as const;

const AddProduct = ({ onProductAdded, onClose }: Props) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const { showToast, showErrorResponse } = useToastContext();
    const [form, setForm] = useState<FormState>({
        name: "",
        description: "",
        categoryId: "",
        price: "",
        currentStock: "",
        urlImage: "",
        weight: "",
        unit: "",
        length: "",
        width: "",
        height: "",
        status: "Active",
        tags: [],
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

        const body = {
            currentStock: Number(form.currentStock || 0),
            status: form.status,
            categoryId: form.categoryId,

            price: Number(form.price),

            property: {
                urlImage: form.urlImage,
                name: form.name,
                description: form.description,
                weight: form.weight,
                unit: form.unit,
                length: Number(form.length || 0),
                width: Number(form.width || 0),
                height: Number(form.height || 0),
            },

            tags: form.tags.map(tagId => ({
                id: tagId
            }))
        };

        try {
            setLoading(true);
            console.log("BODY SEND:", body);
            const res = await createProduct(body);

            if (!res?.data) return;
            showToast("Success", "Tạo sản phẩm thành công");
            onProductAdded?.(res.data);
            onClose?.();
        } catch (err: any) {
            console.error(err.response?.data);
            alert("Tạo sản phẩm thất bại");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field: string) =>
        `border p-2 w-full rounded ${errors[field] ? "border-red-500" : ""
        }`;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto space-y-5">

                <h2 className="text-lg font-semibold text-gray-800">
                    Thêm sản phẩm mới
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
                            URL hình ảnh *
                        </label>

                        <input
                            placeholder="https://example.com/image.jpg"
                            className={inputClass("urlImage")}
                            value={form.urlImage}
                            onChange={e =>
                                setForm({ ...form, urlImage: e.target.value })
                            }
                        />

                        {errors.urlImage && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.urlImage}
                            </p>
                        )}

                        {form.urlImage && (
                            <img
                                src={form.urlImage}
                                alt="Preview"
                                className="mt-3 w-24 h-24 object-cover rounded border"
                            />
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
                            onChange={e => setForm({ ...form, unit: e.target.value })}
                        >
                            <option value="">-- Chọn đơn vị --</option>
                            {UNIT_OPTIONS.map(unit => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>

                        {errors.unit && (
                            <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
                        )}
                    </div>
                </div>

                {/* ===== THÔNG SỐ ===== */}
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
                            onChange={e => setForm({ ...form, length: e.target.value })}
                        />

                        <input
                            type="number"
                            placeholder="Chiều rộng (cm)"
                            className={inputClass("width")}
                            value={form.width}
                            onChange={e => setForm({ ...form, width: e.target.value })}
                        />

                        <input
                            type="number"
                            placeholder="Chiều cao (cm)"
                            className={inputClass("height")}
                            value={form.height}
                            onChange={e => setForm({ ...form, height: e.target.value })}
                        />
                    </div>
                </div>

                {/*  TAG  */}
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
                        {loading ? "Đang lưu..." : "Lưu sản phẩm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;