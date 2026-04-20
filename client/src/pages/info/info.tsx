import { type FormEvent, useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";
import { useToastContext } from "../../contexts/toast-message/toast-message";
import { getAddresses, createAddress } from "../../services/address";
import { useExecute } from "../../hooks/execute";
import UserInfo from "./components/UserInfo";
import Menu from "./components/Menu";
import AddressList from "./components/AddressList";
import PasswordForm from "./components/PasswordForm";
import NotificationSetting from "./components/NotificationSetting";

interface AddressItem {
    id: string;
    label: string;
    recipient: string;
    phone: string;
    detail: string;
    isPrimary?: boolean;
}



const emptyAddress: Omit<AddressItem, "id"> & { ward: string; isDefault: boolean } = {
    label: "",
    recipient: "",
    phone: "",
    detail: "",
    ward: "",
    isDefault: false
};

const emptyPasswordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
};

const InfoPage = () => {
    const { state } = useAuthContext();
    const { showToast } = useToastContext();
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<string>("address");
    const { query } = useExecute();
    // Lấy địa chỉ thật từ server
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!state?.uid) {
                setAddresses([]);
                return;
            }
            const result = await query(getAddresses(state.uid));
            if (result?.data && Array.isArray(result.data)) {
                setAddresses(result.data.map((addr: any) => ({
                    id: addr.id,
                    label: addr.isDefault ? "Nhà riêng" : "Khác", // hoặc cho phép người dùng đặt label
                    recipient: addr.fullName,
                    phone: addr.phone,
                    detail: `${addr.detail}${addr.ward ? ", " + addr.ward : ""}${addr.province ? ", " + addr.province : ""}`,
                    isPrimary: !!addr.isDefault
                })));
            } else {
                setAddresses([]);
            }
        };
        fetchAddresses();
    }, [state?.uid, query]);
    const [addressForm, setAddressForm] = useState(emptyAddress);
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);

    const personalEmail = useMemo(() => state?.email ?? "unknown@greenlife.vn", [state]);

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

    const handleAddAddress = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!addressForm.label || !addressForm.recipient || !addressForm.phone || !addressForm.detail || !addressForm.ward) {
            showToast("Error", "Vui lòng điền đầy đủ thông tin địa chỉ.");
            return;
        }
        if (!state?.uid) return;
        // Chuẩn hóa payload cho API
        const payload = {
            fullName: addressForm.recipient,
            phone: addressForm.phone,
            province: addressForm.label,
            ward: addressForm.ward,
            detail: addressForm.detail,
            isDefault: addressForm.isDefault
        };
        const result = await query(createAddress(state.uid, payload));
        if (result?.errors) {
            showToast("Error", Array.isArray(result.errors) ? result.errors[0] : result.errors);
        } else {
            showToast("Success", "Đã thêm địa chỉ mới.");
            setAddressForm(emptyAddress);
            // Reload lại danh sách địa chỉ
            const reload = await query(getAddresses(state.uid));
            if (reload?.data && Array.isArray(reload.data)) {
                setAddresses(reload.data.map((addr: any) => ({
                    id: addr.id,
                    label: addr.isDefault ? "Nhà riêng" : "Khác",
                    recipient: addr.fullName,
                    phone: addr.phone,
                    detail: `${addr.detail}${addr.ward ? ", " + addr.ward : ""}${addr.province ? ", " + addr.province : ""}`,
                    isPrimary: !!addr.isDefault
                })));
            }
        }
    };

    const handleRemoveAddress = (id: string) => {
        setAddresses((prev) => prev.filter((address) => address.id !== id));
        showToast("Note", "Địa chỉ đã được xoá khỏi danh sách (demo).");
    };

    const handleSetPrimary = (id: string) => {
        setAddresses((prev) => prev.map((address) => ({
            ...address,
            isPrimary: address.id === id
        })));
        showToast("Success", "Địa chỉ mặc định đã được cập nhật (demo).");
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
            <div className="sm-container mx-auto py-10">
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="w-full md:w-[320px] shrink-0 flex flex-col items-center gap-6">
                        <UserInfo email={personalEmail} />
                        <Menu selected={selectedMenu} onSelect={setSelectedMenu} />     
                    </aside>
                    <main className="flex-1 w-full flex flex-col gap-6 min-w-0">
                        {selectedMenu === "address" && (
                            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                                <h2 className="text-xl font-semibold text-green-700 mb-2">Địa chỉ nhận hàng</h2>
                                <p className="text-sm text-gray-500 mb-4">Quản lý địa chỉ giao hàng của bạn. Dữ liệu sẽ được kết nối với bước Checkout.</p>
                                <AddressList addresses={addresses} onSetPrimary={handleSetPrimary} onRemove={handleRemoveAddress} />
                                <form className="rounded-xl border border-dashed border-gray-300 p-4 space-y-4 mt-6" onSubmit={handleAddAddress}>
                                    <h3 className="text-lg font-semibold text-gray-800">Thêm địa chỉ mới</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="text-sm text-gray-500">Tỉnh/Thành phố</label>
                                            <input
                                                type="text"
                                                value={addressForm.label}
                                                onChange={event => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
                                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Phường/Xã</label>
                                            <input
                                                type="text"
                                                value={addressForm.ward}
                                                onChange={event => setAddressForm((prev) => ({ ...prev, ward: event.target.value }))}
                                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Người nhận</label>
                                            <input
                                                type="text"
                                                value={addressForm.recipient}
                                                onChange={event => setAddressForm((prev) => ({ ...prev, recipient: event.target.value }))}
                                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Số điện thoại</label>
                                            <input
                                                type="text"
                                                value={addressForm.phone}
                                                onChange={event => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))}
                                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-500">Địa chỉ chi tiết</label>
                                            <input
                                                type="text"
                                                value={addressForm.detail}
                                                onChange={event => setAddressForm((prev) => ({ ...prev, detail: event.target.value }))}
                                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={addressForm.isDefault}
                                                onChange={event => setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                                                className="accent-green-700 w-5 h-5"
                                            />
                                            <label className="text-sm text-gray-700">Đặt làm mặc định</label>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
                                    >
                                        Thêm địa chỉ
                                    </button>
                                </form>
                            </section>
                        )}
                        {selectedMenu === "password" && (
                            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-green-700 mb-2">Đổi mật khẩu</h2>
                                <p className="text-sm text-gray-500 mb-4">Tăng cường bảo mật cho tài khoản của bạn.</p>
                                <PasswordForm
                                    currentPassword={passwordForm.currentPassword}
                                    newPassword={passwordForm.newPassword}
                                    confirmPassword={passwordForm.confirmPassword}
                                    onChange={(field, value) => setPasswordForm((prev) => ({ ...prev, [field]: value }))}
                                    onSubmit={handlePasswordChange}
                                />
                            </section>
                        )}
                        {selectedMenu === "notification" && (
                            <NotificationSetting />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default InfoPage;
