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
    address: { title: "Địa chỉ nhận hàng", subtitle: "Quản lý danh sách địa chỉ giao hàng của bạn" },
    password: { title: "Đổi mật khẩu", subtitle: "Tăng cường bảo mật cho tài khoản" },
    notification: { title: "Cài đặt thông báo", subtitle: "Tuỳ chỉnh cách bạn nhận thông báo" }
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

    if (!state) {
        return (
            <div className="sm-container mx-auto py-20">
                <div style={{
                    maxWidth: 480, margin: "0 auto",
                    background: "#fff",
                    borderRadius: 20,
                    border: "1.5px dashed #16a34a",
                    padding: "48px 40px",
                    textAlign: "center"
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: "#f0fdf4", border: "2px solid #bbf7d0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px"
                    }}>
                        <svg width="28" height="28" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#15803d", margin: "0 0 10px" }}>Bạn chưa đăng nhập</h2>
                    <p style={{ color: "#6b7280", fontSize: 15, margin: "0 0 28px", lineHeight: 1.6 }}>
                        Vui lòng đăng nhập để xem thông tin tài khoản và quản lý địa chỉ.
                    </p>
                    <NavLink to="/auth/login" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "#15803d", color: "#fff",
                        borderRadius: 10, padding: "12px 28px",
                        fontWeight: 600, fontSize: 15, textDecoration: "none"
                    }}>
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

    const inputStyle: React.CSSProperties = {
        width: "100%",
        borderRadius: 10,
        border: "1.5px solid #d1fae5",
        padding: "10px 14px",
        fontSize: 14,
        color: "#1f2937",
        background: "#f9fafb",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s"
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "#6b7280",
        marginBottom: 6,
        letterSpacing: "0.04em",
        textTransform: "uppercase"
    };

    return (
        <div style={{ background: "#f8fdf9", minHeight: "100vh", paddingBottom: 60 }}>

            {/* Header strip */}
            <div style={{
                background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
                padding: "32px 0 80px"
            }}>
                <div className="sm-container" style={{ margin: "0 auto", padding: "0 24px" }}>
                    <p style={{ color: "#bbf7d0", fontSize: 13, margin: "0 0 4px" }}>Tài khoản</p>
                    <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: 0 }}>
                        {pageTitles[selectedMenu]?.title}
                    </h1>
                </div>
            </div>

            <div className="sm-container" style={{ margin: "0 auto", padding: "0 24px" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "280px 1fr",
                    gap: 24,
                    marginTop: -52,
                    alignItems: "start"
                }}>

                    {/* ── LEFT SIDEBAR ── */}
                    <aside>
                        {/* User card */}
                        <div style={{
                            background: "#fff",
                            borderRadius: 18,
                            padding: "28px 20px",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                            marginBottom: 12,
                            textAlign: "center"
                        }}>
                            <div style={{
                                width: 72, height: 72,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 14px",
                                fontSize: 24, fontWeight: 800, color: "#fff",
                                letterSpacing: "-0.5px"
                            }}>
                                {getInitials(personalEmail)}
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 15, color: "#111827", margin: "0 0 4px" }}>
                                {personalEmail.split("@")[0]}
                            </p>
                            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{personalEmail}</p>

                            <div style={{
                                marginTop: 16, padding: "10px 14px",
                                background: "#f0fdf4", borderRadius: 10,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                            }}>
                                <span style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: "#22c55e", flexShrink: 0
                                }}/>
                                <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>Tài khoản đang hoạt động</span>
                            </div>
                        </div>

                        {/* Navigation menu */}
                        <div style={{
                            background: "#fff",
                            borderRadius: 18,
                            padding: "10px 8px",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.07)"
                        }}>
                            <p style={{
                                fontSize: 10, fontWeight: 700, color: "#9ca3af",
                                letterSpacing: "0.08em", textTransform: "uppercase",
                                padding: "8px 12px 4px", margin: 0
                            }}>Quản lý tài khoản</p>
                            {menuItems.map((item) => {
                                const isActive = selectedMenu === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setSelectedMenu(item.key)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "12px 14px",
                                            borderRadius: 12,
                                            border: "none",
                                            cursor: "pointer",
                                            background: isActive ? "#f0fdf4" : "transparent",
                                            textAlign: "left",
                                            transition: "background 0.15s"
                                        }}
                                    >
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            background: isActive ? "#dcfce7" : "#f3f4f6",
                                            color: isActive ? "#16a34a" : "#6b7280",
                                            transition: "all 0.15s"
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                margin: 0,
                                                fontSize: 14, fontWeight: isActive ? 700 : 500,
                                                color: isActive ? "#15803d" : "#374151",
                                                lineHeight: 1.3
                                            }}>{item.label}</p>
                                            <p style={{
                                                margin: 0, fontSize: 11, color: "#9ca3af",
                                                lineHeight: 1.3, marginTop: 2
                                            }}>{item.desc}</p>
                                        </div>
                                        {isActive && (
                                            <div style={{
                                                width: 4, height: 28, borderRadius: 4,
                                                background: "#16a34a", flexShrink: 0
                                            }}/>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* ── RIGHT CONTENT ── */}
                    <main style={{ minWidth: 0 }}>
                        <div style={{
                            background: "#fff",
                            borderRadius: 18,
                            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                            overflow: "hidden"
                        }}>
                            {/* Content header */}
                            <div style={{
                                padding: "24px 32px 20px",
                                borderBottom: "1.5px solid #f0fdf4",
                                display: "flex", alignItems: "center", gap: 12
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: "#f0fdf4",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#16a34a"
                                }}>
                                    {menuItems.find(m => m.key === selectedMenu)?.icon}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
                                        {pageTitles[selectedMenu]?.title}
                                    </h2>
                                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                                        {pageTitles[selectedMenu]?.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Panel body */}
                            <div style={{ padding: "28px 32px" }}>

                                {/* ADDRESS PANEL */}
                                {selectedMenu === "address" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                                        <AddressList
                                            addresses={addresses}
                                            onSetPrimary={handleSetPrimary}
                                            onRemove={handleRemoveAddress}
                                        />

                                        {/* Add new address form */}
                                        <div style={{
                                            borderRadius: 14,
                                            border: "1.5px dashed #bbf7d0",
                                            background: "#fafffe",
                                            padding: "24px 24px 20px"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: 8,
                                                    background: "#dcfce7", display: "flex",
                                                    alignItems: "center", justifyContent: "center", color: "#16a34a"
                                                }}>
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                                    </svg>
                                                </div>
                                                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1f2937" }}>
                                                    Thêm địa chỉ mới
                                                </h3>
                                            </div>

                                            <form onSubmit={handleAddAddress}>
                                                <div style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "1fr 1fr",
                                                    gap: "16px 20px"
                                                }}>
                                                    <div>
                                                        <label style={labelStyle}>Tỉnh / Thành phố</label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.label}
                                                            onChange={e => setAddressForm(p => ({ ...p, label: e.target.value }))}
                                                            placeholder="VD: TP. Hồ Chí Minh"
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={labelStyle}>Phường / Xã</label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.ward}
                                                            onChange={e => setAddressForm(p => ({ ...p, ward: e.target.value }))}
                                                            placeholder="VD: Phường Bến Nghé"
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={labelStyle}>Người nhận</label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.recipient}
                                                            onChange={e => setAddressForm(p => ({ ...p, recipient: e.target.value }))}
                                                            placeholder="Họ và tên"
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={labelStyle}>Số điện thoại</label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.phone}
                                                            onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))}
                                                            placeholder="0912 345 678"
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div style={{ gridColumn: "1 / -1" }}>
                                                        <label style={labelStyle}>Địa chỉ chi tiết</label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.detail}
                                                            onChange={e => setAddressForm(p => ({ ...p, detail: e.target.value }))}
                                                            placeholder="Số nhà, tên đường, tòa nhà..."
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
                                                        <label style={{
                                                            position: "relative", display: "inline-flex",
                                                            alignItems: "center", cursor: "pointer"
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={addressForm.isDefault}
                                                                onChange={e => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))}
                                                                style={{ width: 18, height: 18, accentColor: "#16a34a", cursor: "pointer" }}
                                                            />
                                                        </label>
                                                        <span style={{ fontSize: 13, color: "#374151" }}>Đặt làm địa chỉ mặc định</span>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: 20 }}>
                                                    <button
                                                        type="submit"
                                                        style={{
                                                            background: "linear-gradient(135deg, #16a34a, #15803d)",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 10,
                                                            padding: "11px 28px",
                                                            fontSize: 14, fontWeight: 700,
                                                            cursor: "pointer",
                                                            display: "inline-flex", alignItems: "center", gap: 8
                                                        }}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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