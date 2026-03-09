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
import { useExecute } from "../../../hooks/execute";
import ButtonForm from "../../button/button-form/button-form";

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

    const { query, loading } = useExecute();
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const { showToast, showErrorResponse } = useToastContext();
    const [previewImage, setPreviewImage] = useState<string>(
        product.property?.urlImage || ""
    );
    const [imageMode, setImageMode] = useState<"upload" | "url">("url");

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

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target?.result as string;
            setForm({ ...form, urlImage: base64String });
            setPreviewImage(base64String);
        };
        reader.readAsDataURL(file);
    };

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
            await query(updateProperty(product.id, {
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
            }));

            if (form.categoryId !== product.categoryId) {
                await query(updateCategory(product.id, form.categoryId));
            }

            await query(updateTags(product.id, form.tags));
            await query(changeStock(product.id, Number(form.currentStock || 0)));
            await query(updateStatus(product.id, form.status));

            onUpdated?.({
                ...product,
                currentStock: Number(form.currentStock),
                status: form.status,
                categoryId: form.categoryId,
                tags: form.tags,
            });
            showToast("Success", "Cập nhật sản phẩm thành công!");
            setTimeout(() => {
                onClose?.();
            }, 500);
        } catch (err: any) {
            console.log("ERROR:", err)
            showToast("Error", "Cập nhật thất bại");
        }
    };

    const inputClass = (field: string) =>
        `px-3 ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-blue-700 py-2 w-full ${errors[field] ? "ring-red-500" : ""}`;

    return (
        <div className="fixed top-0 start-0 bg-gray-800/60 w-full h-screen flex items-center justify-center px-2 md:px-0 z-50">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                    <h1 className="text-lg font-semibold text-blue-700">Chỉnh sửa sản phẩm</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        x
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-6 px-6 py-6">
                        {/* LEFT COLUMN - FORM FIELDS */}
                        <div className="col-span-2 space-y-4">

                            {/* NAME */}
                            <div className="flex flex-col gap-1">
                                <label htmlFor="name" className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
                                    Tên sản phẩm
                                </label>
                                <input
                                    id="name"
                                    placeholder="VD: Chuột Gaming Razer Viper"
                                    className={inputClass("name")}
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs">{errors.name}</p>
                                )}
                            </div>

                            {/* PRICE & STOCK - ROW */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="price" className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
                                        Giá bán (VND)
                                    </label>
                                    <input
                                        id="price"
                                        type="number"
                                        placeholder="VD: 1500000"
                                        className={inputClass("price")}
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })}
                                    />
                                    {errors.price && (
                                        <p className="text-red-500 text-xs">{errors.price}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="stock" className="text-blue-700 font-medium">
                                        Số lượng tồn kho
                                    </label>
                                    <input
                                        id="stock"
                                        type="number"
                                        placeholder="VD: 100"
                                        className={inputClass("currentStock")}
                                        value={form.currentStock}
                                        onChange={e =>
                                            setForm({ ...form, currentStock: e.target.value })
                                        }
                                    />
                                    {errors.currentStock && (
                                        <p className="text-red-500 text-xs">
                                            {errors.currentStock}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* CATEGORY */}
                            <div className="flex flex-col gap-1">
                                <label htmlFor="category" className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
                                    Danh mục
                                </label>
                                <div className="ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-blue-700">
                                    <select
                                        id="category"
                                        className="w-full none-input py-2 px-3 text-sm"
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
                                </div>
                                {errors.categoryId && (
                                    <p className="text-red-500 text-xs">
                                        {errors.categoryId}
                                    </p>
                                )}
                            </div>

                            {/* WEIGHT & UNIT - ROW */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="weight" className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
                                        Trọng lượng
                                    </label>
                                    <input
                                        id="weight"
                                        type="number"
                                        placeholder="VD: 100"
                                        className={inputClass("weight")}
                                        value={form.weight}
                                        onChange={e =>
                                            setForm({ ...form, weight: e.target.value })
                                        }
                                    />
                                    {errors.weight && (
                                        <p className="text-red-500 text-xs">
                                            {errors.weight}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="unit" className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
                                        Đơn vị
                                    </label>
                                    <div className="ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-blue-700">
                                        <select
                                            id="unit"
                                            className="w-full none-input py-2 px-3 text-sm"
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
                                    </div>
                                    {errors.unit && (
                                        <p className="text-red-500 text-xs">{errors.unit}</p>
                                    )}
                                </div>
                            </div>

                            {/* SPECIFICATIONS */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-blue-700">
                                    Thông số kỹ thuật
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="length" className="text-gray-700 font-medium text-xs">Chiều dài (cm)</label>
                                        <input
                                            id="length"
                                            type="number"
                                            placeholder="Dài"
                                            className={inputClass("length")}
                                            value={form.length}
                                            onChange={e =>
                                                setForm({ ...form, length: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="width" className="text-gray-700 font-medium text-xs">Chiều rộng (cm)</label>
                                        <input
                                            id="width"
                                            type="number"
                                            placeholder="Rộng"
                                            className={inputClass("width")}
                                            value={form.width}
                                            onChange={e =>
                                                setForm({ ...form, width: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="height" className="text-gray-700 font-medium text-xs">Chiều cao (cm)</label>
                                        <input
                                            id="height"
                                            type="number"
                                            placeholder="Cao"
                                            className={inputClass("height")}
                                            value={form.height}
                                            onChange={e =>
                                                setForm({ ...form, height: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - IMAGE & TAGS */}
                        <div className="col-span-1 space-y-4">

                            {/* IMAGE UPLOAD/URL */}
                            <div className="flex flex-col gap-2 sticky top-0">
                                <label className="text-blue-700 font-medium">
                                    Hình ảnh sản phẩm
                                </label>
                                
                                <div className="flex gap-2 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setImageMode("upload")}
                                        className={`flex-1 px-2 py-2 rounded text-xs font-medium transition ${
                                            imageMode === "upload"
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        <i className="fa-solid fa-cloud-arrow-up me-1"></i>
                                        Upload
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageMode("url")}
                                        className={`flex-1 px-2 py-2 rounded text-xs font-medium transition ${
                                            imageMode === "url"
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        <i className="fa-solid fa-link me-1"></i>
                                        URL
                                    </button>
                                </div>

                                {imageMode === "upload" ? (
                                    <div>
                                        <label
                                            htmlFor="imageUpload"
                                            className="px-2 ring-1 ring-gray-400 rounded-lg py-3 w-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition border-dashed border-2 border-gray-300"
                                        >
                                            <div className="text-center">
                                                <i className="fa-solid fa-image text-gray-400 text-xl mb-1"></i>
                                                <p className="text-xs text-gray-600">Chọn ảnh</p>
                                            </div>
                                            <input
                                                id="imageUpload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="https://example.com/..."
                                        className={inputClass("urlImage")}
                                        value={form.urlImage}
                                        onChange={(e) =>
                                            setForm({ ...form, urlImage: e.target.value })
                                        }
                                    />
                                )}

                                {previewImage && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-600 mb-1">Preview:</p>
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-full aspect-square object-cover rounded border"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* TAG */}
                            <div className="flex flex-col gap-2">
                                <label className="text-blue-700 font-medium">
                                    Gắn Tag
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-2 py-1 text-xs rounded-full border transition whitespace-nowrap ${form.tags.includes(tag.id)
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
                                                }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-300 flex gap-3 justify-end bg-white">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white ring-1 ring-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Hủy bỏ
                    </button>
                    <ButtonForm
                        className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                        onClick={handleSubmit}
                        inLoading={{ isLoading: loading, textLoading: "Đang cập nhật..." }}
                    >
                        Cập nhật sản phẩm
                    </ButtonForm>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;