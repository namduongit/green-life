import { type FormEvent, useMemo, useState } from "react";
import { NavLink } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";
import { useToastContext } from "../../contexts/toast-message/toast-message";

interface AddressItem {
    id: string;
    label: string;
    recipient: string;
    phone: string;
    detail: string;
    isPrimary?: boolean;
}

const demoAddresses: AddressItem[] = [
    {
        id: "addr-1",
        label: "Nhà riêng",
        recipient: "Lê Minh Khôi",
        phone: "0903 123 456",
        detail: "24/3 Nguyễn Thông, Phường 6, Quận 3, TP. Hồ Chí Minh",
        isPrimary: true
    },
    {
        id: "addr-2",
        label: "Văn phòng",
        recipient: "Lê Minh Khôi",
        phone: "0903 888 111",
        detail: "Tầng 12, Toà nhà GreenLife, Quận 1, TP. Hồ Chí Minh"
    }
];

const emptyAddress: Omit<AddressItem, "id"> = {
    label: "",
    recipient: "",
    phone: "",
    detail: ""
};

const emptyPasswordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
};

const InfoPage = () => {
    const { state } = useAuthContext();
    const { showToast } = useToastContext();
    const [addresses, setAddresses] = useState<AddressItem[]>(demoAddresses);
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

    const handleAddAddress = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!addressForm.label || !addressForm.recipient || !addressForm.phone || !addressForm.detail) {
            showToast("Error", "Vui lòng điền đầy đủ thông tin địa chỉ.");
            return;
        }
        const newAddress: AddressItem = {
            id: `addr-${Date.now()}`,
            ...addressForm
        };
        setAddresses((prev) => [newAddress, ...prev]);
        setAddressForm(emptyAddress);
        showToast("Success", "Đã thêm địa chỉ mới (demo).");
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
                        {addresses.map((address) => (
                            <div key={address.id} className="rounded-xl border border-gray-200 p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">{address.label}</h3>
                                    {address.isPrimary && <span className="text-xs rounded bg-green-700 px-2 py-0.5 text-white">Mặc định</span>}
                                </div>
                                <p className="text-sm text-gray-600">{address.recipient} · {address.phone}</p>
                                <p className="text-sm text-gray-600">{address.detail}</p>
                                <div className="flex flex-wrap gap-3">
                                    {!address.isPrimary && (
                                        <button
                                            type="button"
                                            onClick={() => handleSetPrimary(address.id)}
                                            className="text-sm font-medium text-green-700 hover:underline"
                                        >
                                            Đặt làm mặc định
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAddress(address.id)}
                                        className="text-sm font-medium text-red-600 hover:underline"
                                    >
                                        Xoá địa chỉ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form className="rounded-xl border border-dashed border-gray-300 p-4 space-y-4" onSubmit={handleAddAddress}>
                        <h3 className="text-lg font-semibold text-gray-800">Thêm địa chỉ mới (demo)</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm text-gray-500">Tên hiển thị</label>
                                <input
                                    type="text"
                                    value={addressForm.label}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Người nhận</label>
                                <input
                                    type="text"
                                    value={addressForm.recipient}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, recipient: event.target.value }))}
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={addressForm.phone}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))}
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-500">Địa chỉ chi tiết</label>
                                <input
                                    type="text"
                                    value={addressForm.detail}
                                    onChange={(event) => setAddressForm((prev) => ({ ...prev, detail: event.target.value }))}
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none"
                                />
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
