import { type FormEvent, useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";
import { useToastContext } from "../../contexts/toast-message/toast-message";
import { getAddresses, createAddress } from "../../services/address";
import { useExecute } from "../../hooks/execute";
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

const menuItems = [
    {
        key: "address",
        label: "Địa chỉ nhận hàng",
        desc: "Quản lý địa chỉ giao hàng",
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    },
    {
        key: "password",
        label: "Đổi mật khẩu",
        desc: "Cập nhật bảo mật tài khoản",
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="5" y="11" width="14" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 018 0v4"/>
                <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
        )
    },
    {
        key: "notification",
        label: "Thông báo",
        desc: "Tùy chỉnh nhận thông báo",
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
        )
    }
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    address:      { title: "Địa chỉ nhận hàng",    subtitle: "Quản lý danh sách địa chỉ giao hàng của bạn" },
    password:     { title: "Đổi mật khẩu",          subtitle: "Tăng cường bảo mật cho tài khoản" },
    notification: { title: "Cài đặt thông báo",     subtitle: "Tuỳ chỉnh cách bạn nhận thông báo" }
};

const InfoPage = () => {
    const { state } = useAuthContext();
    const { showToast } = useToastContext();
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<string>("address");
    const { query } = useExecute();

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!state?.uid) { setAddresses([]); return; }
            const result = await query(getAddresses(state.uid));
            if (result?.data && Array.isArray(result.data)) {
                setAddresses(result.data.map((addr: any) => ({
                    id: addr.id,
                    label: addr.isDefault ? "Nhà riêng" : "Khác",
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

    const getInitials = (email: string) => email.slice(0, 2).toUpperCase();

    /* ── Unauthenticated ── */
    if (!state) {
        return (
            <div className="sm-container mx-auto py-20">
                <div className="mx-auto max-w-md rounded-2xl border border-dashed border-green-300 bg-white p-12 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-200 bg-green-50">
                        <svg width="28" height="28" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[rgb(51,102,51)]">Bạn chưa đăng nhập</h2>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        Vui lòng đăng nhập để xem thông tin tài khoản và quản lý địa chỉ.
                    </p>
                    <NavLink
                        to="/auth/login"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[rgb(51,102,51)] px-7 py-3 text-sm font-semibold text-white hover:bg-[#2d7a2d]"
                    >
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
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        showToast("Note", "Địa chỉ đã được xoá khỏi danh sách.");
    };

    const handleSetPrimary = (id: string) => {
        setAddresses((prev) => prev.map((a) => ({ ...a, isPrimary: a.id === id })));
        showToast("Success", "Địa chỉ mặc định đã được cập nhật.");
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
        showToast("Success", "Yêu cầu đổi mật khẩu đã được ghi nhận.");
        setPasswordForm(emptyPasswordForm);
    };

    const currentPageMeta = pageTitles[selectedMenu];
    const currentMenuIcon = menuItems.find(m => m.key === selectedMenu)?.icon;

    return (
        <div className="min-h-screen bg-gray-50 pb-16">

            {/* ── Page header ── */}
            <div className="border-b border-gray-200 bg-white px-0 py-6">
                <div className="sm-container mx-auto px-6">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Tài khoản</p>
                    <h1 className="mt-0.5 text-xl font-bold text-gray-800">{currentPageMeta?.title}</h1>
                </div>
            </div>

            <div className="sm-container mx-auto px-6 py-6">
                <div className="grid gap-5" style={{ gridTemplateColumns: "260px 1fr", alignItems: "start" }}>

                    {/* ── LEFT SIDEBAR ── */}
                    <aside className="sticky top-6 space-y-3">

                        {/* User card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(51,102,51)] text-2xl font-bold text-white">
                                {getInitials(personalEmail)}
                            </div>
                            <p className="font-bold text-gray-800">{personalEmail.split("@")[0]}</p>
                            <p className="mt-0.5 text-xs text-gray-400">{personalEmail}</p>
                            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2">
                                <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                                <span className="text-xs font-semibold text-[rgb(51,102,51)]">Tài khoản đang hoạt động</span>
                            </div>
                        </div>

                        {/* Navigation menu */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="border-b border-gray-100 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Quản lý tài khoản</p>
                            </div>
                            <nav className="p-2 space-y-0.5">
                                {menuItems.map((item) => {
                                    const isActive = selectedMenu === item.key;
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => setSelectedMenu(item.key)}
                                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left ${
                                                isActive ? "bg-green-50" : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                isActive ? "bg-green-100 text-[rgb(51,102,51)]" : "bg-gray-100 text-gray-500"
                                            }`}>
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold ${isActive ? "text-[rgb(51,102,51)]" : "text-gray-700"}`}>
                                                    {item.label}
                                                </p>
                                                <p className="text-[11px] text-gray-400">{item.desc}</p>
                                            </div>
                                            {isActive && (
                                                <div className="w-1 h-6 rounded-full bg-[rgb(51,102,51)] shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* ── RIGHT CONTENT ── */}
                    <main className="min-w-0">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                            {/* Content header */}
                            <div className="flex items-center gap-3 border-b border-gray-100 px-7 py-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[rgb(51,102,51)]">
                                    {currentMenuIcon}
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">{currentPageMeta?.title}</h2>
                                    <p className="text-sm text-gray-400">{currentPageMeta?.subtitle}</p>
                                </div>
                            </div>

                            {/* Panel body */}
                            <div className="p-7">

                                {/* ADDRESS PANEL */}
                                {selectedMenu === "address" && (
                                    <div className="space-y-7">
                                        <AddressList
                                            addresses={addresses}
                                            onSetPrimary={handleSetPrimary}
                                            onRemove={handleRemoveAddress}
                                        />

                                        {/* Add new address form */}
                                        <div className="rounded-xl border border-dashed border-green-200 bg-gray-50 p-6">
                                            <div className="mb-5 flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-[rgb(51,102,51)]">
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                                    </svg>
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-800">Thêm địa chỉ mới</h3>
                                            </div>

                                            <form onSubmit={handleAddAddress}>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                                            Tỉnh / Thành phố
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.label}
                                                            onChange={e => setAddressForm(p => ({ ...p, label: e.target.value }))}
                                                            placeholder="VD: TP. Hồ Chí Minh"
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                                            Phường / Xã
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.ward}
                                                            onChange={e => setAddressForm(p => ({ ...p, ward: e.target.value }))}
                                                            placeholder="VD: Phường Bến Nghé"
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                                            Người nhận
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.recipient}
                                                            onChange={e => setAddressForm(p => ({ ...p, recipient: e.target.value }))}
                                                            placeholder="Họ và tên"
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                                            Số điện thoại
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.phone}
                                                            onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))}
                                                            placeholder="0912 345 678"
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                                            Địa chỉ chi tiết
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.detail}
                                                            onChange={e => setAddressForm(p => ({ ...p, detail: e.target.value }))}
                                                            placeholder="Số nhà, tên đường, tòa nhà..."
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 flex items-center gap-2.5">
                                                        <input
                                                            type="checkbox"
                                                            id="isDefault"
                                                            checked={addressForm.isDefault}
                                                            onChange={e => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))}
                                                            className="h-4 w-4 cursor-pointer accent-green-600"
                                                        />
                                                        <label htmlFor="isDefault" className="cursor-pointer text-sm text-gray-600">
                                                            Đặt làm địa chỉ mặc định
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="mt-5">
                                                    <button
                                                        type="submit"
                                                        className="inline-flex items-center gap-2 rounded-lg bg-[rgb(51,102,51)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d7a2d]"
                                                    >
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                                        </svg>
                                                        Thêm địa chỉ
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {/* PASSWORD PANEL */}
                                {selectedMenu === "password" && (
                                    <PasswordForm
                                        currentPassword={passwordForm.currentPassword}
                                        newPassword={passwordForm.newPassword}
                                        confirmPassword={passwordForm.confirmPassword}
                                        onChange={(field, value) => setPasswordForm(p => ({ ...p, [field]: value }))}
                                        onSubmit={handlePasswordChange}
                                    />
                                )}

                                {/* NOTIFICATION PANEL */}
                                {selectedMenu === "notification" && (
                                    <NotificationSetting />
                                )}

                            </div>
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
};

export default InfoPage;