import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import LayerCart from "../../components/layer-cart/layer-cart";
import { useAuthContext } from "../../contexts/auth/auth";
import { useCart } from "../../contexts/cart/cart";
import { useToastContext } from "../../contexts/toast-message/toast-message";
import { useExecute } from "../../hooks/execute";
import { getAddresses } from "../../services/address";
import type {
    AddressPayload,
    AddressRep,
} from "../../services/address/address.type";
import { createOrder } from "../../services/order/order.service";
import type { OrderPaymentMethod } from "../../lib/types/enums.typs";

type AddressField = keyof Omit<AddressPayload, "isDefault">;

const initialAddressForm: AddressPayload = {
    fullName: "",
    phone: "",
    province: "",
    ward: "",
    detail: "",
    isDefault: false,
};

const paymentOptions: { id: OrderPaymentMethod; title: string; description: string }[] = [
    { id: "Cod", title: "Thanh toán khi nhận hàng", description: "Thanh toán trực tiếp cho shipper, phù hợp mọi khu vực." },
    { id: "Momo", title: "Ví điện tử MoMo", description: "Cổng thanh toán an toàn, hỗ trợ trả góp 0%." },
    { id: "SePay", title: "Cổng thanh toán Sepay", description: "Chuyển khoản nhanh qua Sepay, xác nhận tức thì." }
];

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const { state } = useAuthContext();
    const { showToast, showErrorResponse } = useToastContext();

    const { query: fetchOrders, loading: loadingOrders } = useExecute();

    const { query: fetchAddresses, loading: loadingAddresses } = useExecute();

    const [addresses, setAddresses] = useState<AddressRep[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
    const [addressForm, setAddressForm] = useState<AddressPayload>({ ...initialAddressForm });
    const [discountCode, setDiscountCode] = useState("");
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>("Cod");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [formMessage, setFormMessage] = useState<string | null>(null);

    const refreshAddresses = async () => {
        if (!state?.uid) {
            setAddresses([]);
            setSelectedAddressId("new");
            setAddressForm({ ...initialAddressForm });
            return;
        }

        const result = await fetchAddresses<AddressRep[]>(getAddresses(state.uid));
        if (result?.errors) {
            showErrorResponse(result.errors);
            return;
        }

        const addressesData = result?.data;
        if (addressesData) {
            setAddresses(addressesData);
            if (addressesData.length === 0) {
                setSelectedAddressId("new");
                setAddressForm({ ...initialAddressForm });
                return;
            }
            setSelectedAddressId((prev) => {
                if (prev !== "new" && addressesData.some((addr) => addr.id === prev)) {
                    return prev;
                }
                const defaultAddress = addressesData.find((addr) => addr.isDefault);
                return defaultAddress?.id ?? addressesData[0].id;
            });
        }
    };

    useEffect(() => {
        void refreshAddresses();
    }, [state?.uid]);

    useEffect(() => {
        if (selectedAddressId === "new") {
            return;
        }
        const matched = addresses.find((addr) => addr.id === selectedAddressId);
        if (matched) {
            setAddressForm({
                fullName: matched.fullName,
                phone: matched.phone,
                province: matched.province,
                ward: matched.ward,
                detail: matched.detail,
                isDefault: matched.isDefault,
            });
        }
    }, [selectedAddressId, addresses]);

    useEffect(() => {
        setIsConfirmed(false);
    }, [addressForm, paymentMethod, selectedAddressId, appliedCode]);

    const handleAddressInput = (field: AddressField, value: string) => {
        setAddressForm((prev) => ({ ...prev, [field]: value }));
        setSelectedAddressId("new");
    };

    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cartItems]);
    const vat = cartItems.length > 0 ? 10000 : 0;
    const shippingEstimate = useMemo(() => {
        if (subtotal === 0) return 0;
        const minFee = 15000;
        const suggested = Math.round(subtotal * 0.02);
        const maxFee = Math.round(subtotal * 0.03);
        return Math.min(Math.max(minFee, suggested), maxFee);
    }, [subtotal]);
    const discountValue = appliedCode ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal + vat + shippingEstimate - discountValue;

    const isAddressValid =
        addressForm.fullName.trim().length > 0 &&
        addressForm.phone.trim().length > 0 &&
        addressForm.province.trim().length > 0 &&
        addressForm.ward.trim().length > 0 &&
        addressForm.detail.trim().length > 0;
    const canConfirm = isAddressValid && cartItems.length > 0;

    const handleConfirm = () => {
        if (!canConfirm) {
            setFormMessage("Vui lòng điền đầy đủ thông tin nhận hàng và đảm bảo giỏ hàng không trống.");
            showToast("Error", "Chưa thể xác nhận thông tin.");
            return;
        }
        setFormMessage(null);
        setIsConfirmed(true);
        showToast("Success", "Thông tin đơn hàng đã được xác nhận.");
    };

    const handlePlaceOrder = async () => {
        if (!isConfirmed) {
            setFormMessage("Bạn cần xác nhận thông tin trước khi thanh toán.");
            showToast("Note", "Xác nhận thông tin để tiếp tục thanh toán.");
            return;
        }
        const result = await fetchOrders<any>(createOrder({
            recipientName: addressForm.fullName,
            recipientPhone: addressForm.phone,
            recipientProvince: addressForm.province,
            recipientWard: addressForm.ward,
            recipientDetail: addressForm.detail,
            orderItem: cartItems.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
            })),
            paymentMethod,
        }));
        if (result?.data) {
            showToast("Success", "Đơn hàng của bạn đã được tạo thành công!");
            if (paymentMethod === "Momo" || paymentMethod === "SePay") {
                // Todo later
            }
            else {
                navigate("/order-success");
            }
        }
    };

    const handleApplyDiscount = () => {
        if (!discountCode.trim()) {
            showToast("Error", "Vui lòng nhập mã giảm giá hợp lệ.");
            return;
        }
        setAppliedCode(discountCode.trim().toUpperCase());
        showToast("Success", "Mã giảm giá đã được lưu. Hệ thống sẽ áp dụng khi thanh toán.");
    };

    const handleRemoveDiscount = () => {
        setAppliedCode(null);
        showToast("Note", "Đã gỡ mã giảm giá.");
    };

    return (
        <div className="pb-20">
            <LayerCart />
            <div className="sm-container mx-auto flex flex-col lg:flex-row gap-8 py-10">
                <section className="flex-2 space-y-8">
                    <div className="border border-gray-200 rounded-xl p-5 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Bước 1</p>
                                <h2 className="text-xl font-semibold text-green-700">Thông tin nhận hàng</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => void refreshAddresses()}
                                disabled={loadingAddresses}
                                className="text-sm text-green-700 hover:underline disabled:opacity-50"
                            >
                                {loadingAddresses ? "Đang tải..." : "Tải lại địa chỉ"}
                            </button>
                        </div>
                        <div className="space-y-3">
                            {!state && (
                                <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                                    Đăng nhập để sử dụng các địa chỉ đã lưu. Bạn vẫn có thể nhập địa chỉ mới bên dưới.
                                </p>
                            )}
                            {loadingAddresses && (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                </div>
                            )}
                            {!loadingAddresses && state && addresses.length === 0 && (
                                <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-center">
                                    Bạn chưa có địa chỉ đã lưu. Hãy thêm địa chỉ mới để sử dụng cho lần sau.
                                </p>
                            )}
                            {!loadingAddresses && addresses.length > 0 && (
                                <div className="space-y-3">
                                    {addresses.map((addr) => (
                                        <label
                                            key={addr.id}
                                            className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${selectedAddressId === addr.id ? "border-green-600 bg-green-50" : "border-gray-200"}`}
                                        >
                                            <input
                                                type="radio"
                                                className="mt-1"
                                                checked={selectedAddressId === addr.id}
                                                onChange={() => setSelectedAddressId(addr.id)}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{addr.fullName}</h3>
                                                    {addr.isDefault && (
                                                        <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded">
                                                            Mặc định
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {addr.phone}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {addr.detail}, {addr.ward}, {addr.province}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            <label className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${selectedAddressId === "new" ? "border-green-600 bg-green-50" : "border-dashed"}`}>
                                <input
                                    type="radio"
                                    checked={selectedAddressId === "new"}
                                    onChange={() => {
                                        setSelectedAddressId("new");
                                        setAddressForm({ ...initialAddressForm });
                                    }}
                                />
                                <div>
                                    <h3 className="font-semibold">Thêm địa chỉ mới</h3>
                                    <p className="text-sm text-gray-600">Điền thông tin bên dưới để lưu địa chỉ khác.</p>
                                </div>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Họ và tên</label>
                                <input
                                    type="text"
                                    value={addressForm.fullName}
                                    onChange={(e) => handleAddressInput("fullName", e.target.value)}
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={addressForm.phone}
                                    onChange={(e) => handleAddressInput("phone", e.target.value)}
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Tỉnh/Thành phố</label>
                                <input
                                    type="text"
                                    value={addressForm.province}
                                    onChange={(e) => handleAddressInput("province", e.target.value)}
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Phường/Xã</label>
                                <input
                                    type="text"
                                    value={addressForm.ward}
                                    onChange={(e) => handleAddressInput("ward", e.target.value)}
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Địa chỉ cụ thể</label>
                                <textarea
                                    value={addressForm.detail}
                                    onChange={(e) => handleAddressInput("detail", e.target.value)}
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-5 space-y-5">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Bước 2</p>
                            <h2 className="text-xl font-semibold text-green-700">Phương thức thanh toán</h2>
                            <p className="text-sm text-gray-500">Chọn phương thức phù hợp. Bạn vẫn có thể thay đổi ở bước thanh toán cuối.</p>
                        </div>
                        <div className="space-y-3">
                            {paymentOptions.map((method) => (
                                <label
                                    key={method.id}
                                    className={`flex gap-3 rounded-lg border p-4 cursor-pointer transition ${paymentMethod === method.id ? "border-green-600 bg-green-50" : "border-gray-200"}`}
                                >
                                    <input
                                        type="radio"
                                        checked={paymentMethod === method.id}
                                        onChange={() => setPaymentMethod(method.id)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <h3 className="font-semibold">{method.title}</h3>
                                        <p className="text-sm text-gray-600">{method.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Bước 3</p>
                            <h2 className="text-xl font-semibold text-green-700">Xác nhận thông tin</h2>
                            <p className="text-sm text-gray-500">Kiểm tra lại địa chỉ, phương thức thanh toán và đơn hàng trước khi thanh toán.</p>
                        </div>
                        {formMessage && <p className="text-sm text-red-600">{formMessage}</p>}
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            className="w-full rounded-lg border border-green-700 px-4 py-2 font-semibold text-green-700 transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-green-700 hover:text-white"
                        >
                            Xác nhận thông tin
                        </button>
                        {isConfirmed && (
                            <p className="text-sm text-green-700">
                                ✓ Bạn đã xác nhận thông tin. Tiếp tục thanh toán để hoàn tất đơn hàng.
                            </p>
                        )}
                    </div>
                </section>

                <aside className="flex-1 space-y-6">
                    <div className="border-2 border-gray-200 rounded-xl p-5 space-y-4">
                        <h2 className="text-xl font-semibold text-green-700">Đơn hàng của bạn</h2>
                        <div className="max-h-72 overflow-y-auto divide-y">
                            {cartItems.length === 0 && (
                                <p className="py-4 text-sm text-gray-500 text-center">Chưa có sản phẩm trong giỏ hàng.</p>
                            )}
                            {cartItems.map((item) => (
                                <div key={item.product.id} className="flex items-center gap-3 py-3">
                                    <img src={item.product.urlImage} alt={item.product.name} className="h-16 w-16 rounded object-cover" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 line-clamp-1">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-green-700">
                                        {(item.product.price * item.quantity).toLocaleString("vi-VN")} đ
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>{subtotal.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>VAT</span>
                                <span>{vat.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển (ước tính)</span>
                                <span>{shippingEstimate.toLocaleString("vi-VN")} đ</span>
                            </div>
                            {appliedCode && (
                                <div className="flex justify-between text-green-700">
                                    <span>Mã giảm giá ({appliedCode})</span>
                                    <span>-{discountValue.toLocaleString("vi-VN")} đ</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-semibold text-green-700 border-t border-dashed pt-2">
                                <span>Tổng cộng</span>
                                <span>{total.toLocaleString("vi-VN")} đ</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-600">Mã giảm giá</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    disabled={!!appliedCode}
                                    placeholder="Nhập mã nếu có"
                                    className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none disabled:bg-gray-100"
                                />
                                {appliedCode ? (
                                    <button
                                        type="button"
                                        onClick={handleRemoveDiscount}
                                        className="rounded bg-red-50 px-4 py-2 font-semibold text-red-600 hover:bg-red-100"
                                    >
                                        Huỷ
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleApplyDiscount}
                                        className="rounded bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
                                    >
                                        Áp dụng
                                    </button>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={!isConfirmed || loadingOrders || cartItems.length === 0}
                            className="w-full rounded-lg bg-green-700 px-4 py-3 text-white font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-green-800"
                        >
                            {loadingOrders ? "Đang xử lý..." : "Thanh toán"}
                        </button>
                        <p className="text-xs text-gray-500">Xác nhận xong mới được thanh toán. Số tiền có thể thay đổi nếu phí vận chuyển thực tế khác biệt.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="before:content-['*'] before:text-red-700 before:pe-1">
                            Phí vận chuyển thực tế sẽ được cập nhật trong quá trình giao hàng và không vượt quá 3% (tối thiểu 15.000 đ) giá trị đơn hàng.
                        </span>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CheckoutPage;
