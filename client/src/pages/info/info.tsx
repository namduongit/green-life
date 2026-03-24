import { type FormEvent, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";
import { useToastContext } from "../../contexts/toast-message/toast-message";
import { useExecute } from "../../hooks/execute";
import {
    createAddress,
    deleteAddress,
    getAddresses,
    updateAddress,
} from "../../services/address";
import type {
    AddressPayload,
    AddressRep,
} from "../../services/address/address.type";

const emptyAddressForm: AddressPayload = {
    fullName: "",
    phone: "",
    province: "",
    ward: "",
    detail: "",
    isDefault: false,
};

const emptyPasswordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
};

const InfoPage = () => {
    const { state } = useAuthContext();
    const { showToast, showErrorResponse } = useToastContext();
    const { query: fetchAddresses, loading: fetchingAddresses } = useExecute();
    const { query: mutateAddress, loading: mutatingAddress } = useExecute();
    const [addresses, setAddresses] = useState<AddressRep[]>([]);
    const [addressForm, setAddressForm] = useState<AddressPayload>({ ...emptyAddressForm });
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);

    const personalEmail = useMemo(() => state?.email ?? "unknown@greenlife.vn", [state]);

    const loadAddresses = async () => {
        if (!state?.uid) {
            setAddresses([]);
            return;
        }
        const result = await fetchAddresses<AddressRep[]>(getAddresses(state.uid));
        if (result?.errors) {
            showErrorResponse(result.errors);
            return;
        }
        if (result?.data) {
            setAddresses(result.data);
        }
    }

    useEffect(() => {
        loadAddresses();
    }, [state?.uid]);

    const resetAddressForm = () => {
        setAddressForm({ ...emptyAddressForm });
        setEditingAddressId(null);
    };

    const isEditingAddress = Boolean(editingAddressId);
    const isAddressFormValid =
        addressForm.fullName.trim().length > 0 &&
        addressForm.phone.trim().length > 0 &&
        addressForm.province.trim().length > 0 &&
        addressForm.ward.trim().length > 0 &&
        addressForm.detail.trim().length > 0;

    if (!state) {
        return (
            <div className="sm-container mx-auto py-16">
                <div className="rounded-xl border border-dashed border-green-600 px-6 py-10 text-center space-y-4">
                    <h1 className="text-2xl font-semibold text-green-700">Bạn chưa đăng nhập</h1>
                    <p className="text-gray-600">Vui lòng đăng nhập để xem thông tin tài khoản và quản lý địa chỉ.</p>
                    <NavLink to="/auth/login" className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800">
                        Đăng nhập ngay
                    </NavLink>
                </div>
            </div>
        );
    }

    const handleSubmitAddress = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!state?.uid) {
            showToast("Error", "Vui lòng đăng nhập để quản lý địa chỉ.");
            return;
        }

        if (
            !addressForm.fullName.trim() ||
            !addressForm.phone.trim() ||
            !addressForm.province.trim() ||
            !addressForm.ward.trim() ||
            !addressForm.detail.trim()
        ) {
            showToast("Error", "Vui lòng điền đầy đủ thông tin địa chỉ.");
            return;
        }

        const payload: AddressPayload = {
            fullName: addressForm.fullName.trim(),
            phone: addressForm.phone.trim(),
            province: addressForm.province.trim(),
            ward: addressForm.ward.trim(),
            detail: addressForm.detail.trim(),
            isDefault: Boolean(addressForm.isDefault),
        };

        if (editingAddressId) {
            const result = await mutateAddress<AddressRep>(
                updateAddress(state.uid, editingAddressId, payload),
            );
            if (result?.errors) {
                showErrorResponse(result.errors);
                return;
            }
            showToast("Success", "Đã cập nhật địa chỉ thành công.");
        } else {
            const result = await mutateAddress<AddressRep>(
                createAddress(state.uid, payload),
            );
            if (result?.errors) {
                showErrorResponse(result.errors);
                return;
            }
            showToast("Success", "Đã thêm địa chỉ mới.");
        }

        resetAddressForm();
        await loadAddresses();
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!state?.uid) {
            showToast("Error", "Vui lòng đăng nhập để quản lý địa chỉ.");
            return;
        }
        const result = await mutateAddress<{ id: string }>(
            deleteAddress(state.uid, addressId),
        );
        if (result?.errors) {
            showErrorResponse(result.errors);
            return;
        }
        if (editingAddressId === addressId) {
            resetAddressForm();
        }
        showToast("Success", "Địa chỉ đã được xoá.");
        await loadAddresses();
    };

    const handleSetDefault = async (addressId: string) => {
        if (!state?.uid) {
            showToast("Error", "Vui lòng đăng nhập để quản lý địa chỉ.");
            return;
        }
        const result = await mutateAddress<AddressRep>(
            updateAddress(state.uid, addressId, { isDefault: true }),
        );
        if (result?.errors) {
            showErrorResponse(result.errors);
            return;
        }
        showToast("Success", "Địa chỉ mặc định đã được cập nhật.");
        if (editingAddressId === addressId) {
            setAddressForm((prev) => ({ ...prev, isDefault: true }));
        }
        await loadAddresses();
    };

    const handleEditAddress = (address: AddressRep) => {
        setEditingAddressId(address.id);
        setAddressForm({
            fullName: address.fullName,
            phone: address.phone,
            province: address.province,
            ward: address.ward,
            detail: address.detail,
            isDefault: address.isDefault,
        });
    };

    const handlePasswordChange = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            showToast("Error", "Vui lòng nhập đầy đủ thông tin đổi mật khẩu.");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast("Error", "Mật khẩu nhập lại chưa khớp.");
            return;
        }
        showToast("Success", "Yêu cầu đổi mật khẩu đã được ghi nhận (demo).");
        setPasswordForm(emptyPasswordForm);
    };

    return (
        <div className="pb-20">
            <div className="sm-container mx-auto py-10 space-y-8">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-green-700">Thông tin cá nhân</h2>
                    <p className="text-sm text-gray-500">Thông tin được đồng bộ từ hồ sơ đăng ký.</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-gray-100 bg-green-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                            <p className="text-lg font-semibold text-green-800">{personalEmail}</p>
                        </div>
                        <div className="rounded-xl border border-dashed border-gray-200 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">UID</p>
                            <p className="text-lg font-semibold text-gray-700">{state.uid}</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-green-700">Địa chỉ nhận hàng</h2>
                            <p className="text-sm text-gray-500">Quản lý địa chỉ giao hàng của bạn. Dữ liệu sẽ được kết nối với bước Checkout.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {fetchingAddresses && (
                            <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
                                Đang tải danh sách địa chỉ...
                            </div>
                        )}

                        {!fetchingAddresses && addresses.length === 0 && (
                            <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
                                Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ đầu tiên để quá trình đặt hàng nhanh hơn.
                            </div>
                        )}

                        {!fetchingAddresses &&
                            addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={`rounded-xl border p-4 space-y-2 ${
                                        address.isDefault ? "border-green-600" : "border-gray-200"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{address.fullName}</h3>
                                            <p className="text-sm text-gray-600">{address.phone}</p>
                                        </div>
                                        {address.isDefault && (
                                            <span className="text-xs rounded bg-green-700 px-2 py-0.5 text-white">
                                                Mặc định
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{address.detail}</p>
                                    <p className="text-sm text-gray-500">{address.ward}, {address.province}</p>
                                    <div className="flex flex-wrap gap-3 text-sm font-medium">
                                        {!address.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetDefault(address.id)}
                                                disabled={mutatingAddress}
                                                className="text-green-700 hover:underline disabled:opacity-50"
                                            >
                                                Đặt làm mặc định
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleEditAddress(address)}
                                            className="text-blue-700 hover:underline"
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAddress(address.id)}
                                            disabled={mutatingAddress}
                                            className="text-red-600 hover:underline disabled:opacity-50"
                                        >
                                            Xoá địa chỉ
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <form
                        className="rounded-xl border border-dashed border-gray-300 p-4 space-y-4"
                        onSubmit={handleSubmitAddress}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {isEditingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                            </h3>
                            {isEditingAddress && (
                                <button
                                    type="button"
                                    onClick={resetAddressForm}
                                    className="text-sm text-gray-500 hover:underline"
                                >
                                    Huỷ chỉnh sửa
                                </button>
                            )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm text-gray-500">Họ và tên người nhận</label>
                                <input
                                    type="text"
                                    value={addressForm.fullName}
                                    onChange={(event) =>
                                        setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))
                                    }
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={addressForm.phone}
                                    onChange={(event) =>
                                        setAddressForm((prev) => ({ ...prev, phone: event.target.value }))
                                    }
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Tỉnh / Thành phố</label>
                                <input
                                    type="text"
                                    value={addressForm.province}
                                    onChange={(event) =>
                                        setAddressForm((prev) => ({ ...prev, province: event.target.value }))
                                    }
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Phường / Xã</label>
                                <input
                                    type="text"
                                    value={addressForm.ward}
                                    onChange={(event) =>
                                        setAddressForm((prev) => ({ ...prev, ward: event.target.value }))
                                    }
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-500">Địa chỉ chi tiết</label>
                                <textarea
                                    value={addressForm.detail}
                                    onChange={(event) =>
                                        setAddressForm((prev) => ({ ...prev, detail: event.target.value }))
                                    }
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                    rows={3}
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={Boolean(addressForm.isDefault)}
                                    onChange={(event) =>
                                        setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
                                />
                                Đặt làm địa chỉ mặc định
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={!isAddressFormValid || mutatingAddress}
                            className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            {isEditingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
                        </button>
                    </form>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-green-700">Đổi mật khẩu</h2>
                    <p className="text-sm text-gray-500">Tăng cường bảo mật cho tài khoản của bạn.</p>
                    <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handlePasswordChange}>
                        <div>
                            <label className="text-sm text-gray-500">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Nhập lại mật khẩu</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <button type="submit" className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800">
                                Cập nhật mật khẩu
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default InfoPage;
