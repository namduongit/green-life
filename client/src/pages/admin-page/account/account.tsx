import { useState, useEffect, useCallback, useMemo } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";
import {
    getAllAccounts, lockAccount, activateAccount, resetAccountPassword,
    type AccountRep,
} from "../../../services/account";
import { useExecute } from "../../../hooks/execute";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import { useModalConfirmContext } from "../../../contexts/modal-confirm/modal-confirm";
import AddAccount from "../../../components/add/account/add-account";
import EditAccount from "../../../components/edit/account/edit-account";

/* ─── Reset Password Modal — matches AddAccount style ─── */
const ResetPasswordModal = ({
    account,
    onClose,
    onSuccess,
}: {
    account: AccountRep;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const [newPass, setNewPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [err, setErr] = useState("");
    const { query, loading } = useExecute();
    const { showToast, showErrorResponse } = useToastContext();

    const handleSubmit = async () => {
        if (newPass.length < 6) { setErr("Mật khẩu phải ít nhất 6 ký tự"); return; }
        if (newPass !== confirm) { setErr("Xác nhận mật khẩu không khớp"); return; }
        setErr("");
        const res = await query(resetAccountPassword(account.id, newPass));
        if (res?.data) {
            showToast("Success", "Đặt lại mật khẩu thành công!");
            onSuccess();
        } else if (res?.errors) {
            showErrorResponse(res.errors);
        }
    };

    return (
        <div className="fixed top-0 start-0 bg-gray-800/60 w-full h-screen flex items-center justify-center px-2 md:px-0 z-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                    <h1 className="text-lg font-semibold text-blue-700">Đặt lại mật khẩu</h1>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-4">
                    <p className="text-sm text-gray-500">
                        Tài khoản: <span className="font-medium text-gray-700">{account.email}</span>
                    </p>

                    {/* New password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
                            Mật khẩu mới
                        </label>
                        <div className="px-3 ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-blue-700 flex items-center">
                            <i className="fa-solid fa-key text-gray-600" />
                            <input
                                type={showNew ? "text" : "password"}
                                className="none-input ps-2 py-2 w-full"
                                placeholder="Tối thiểu 6 ký tự"
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                            />
                            <i className={`fa-solid ${showNew ? "fa-eye" : "fa-eye-slash"} text-gray-600 cursor-pointer`}
                                onClick={() => setShowNew(!showNew)} />
                        </div>
                    </div>

                    {/* Confirm */}
                    <div className="flex flex-col gap-1">
                        <label className="text-blue-700 font-medium after:content-['*'] after:text-red-700">
                            Xác nhận mật khẩu
                        </label>
                        <div className="px-3 ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-blue-700 flex items-center">
                            <i className="fa-solid fa-key text-gray-600" />
                            <input
                                type={showConfirm ? "text" : "password"}
                                className="none-input ps-2 py-2 w-full"
                                placeholder="Nhập lại mật khẩu"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                            />
                            <i className={`fa-solid ${showConfirm ? "fa-eye" : "fa-eye-slash"} text-gray-600 cursor-pointer`}
                                onClick={() => setShowConfirm(!showConfirm)} />
                        </div>
                    </div>

                    {err && <p className="text-red-500 text-xs">{err}</p>}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-300 flex gap-3 justify-end">
                    <button onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white ring-1 ring-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                        Hủy bỏ
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                        {loading ? "Đang lưu..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Main page ─── */
const AdminAccount = () => {
    const { query, loading } = useExecute();
    const [accounts, setAccounts] = useState<AccountRep[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<AccountRep | null>(null);
    const [resetTarget, setResetTarget] = useState<AccountRep | null>(null);

    const { showToast, showErrorResponse } = useToastContext();
    const { waitConfirm } = useModalConfirmContext();

    const fetchAccounts = useCallback(async () => {
        const response = await query<AccountRep[]>(getAllAccounts());
        if (response?.data) {
            const data = Array.isArray(response.data) ? response.data : [];
            setAccounts(data);
        }
    }, []);

    useEffect(() => { void fetchAccounts(); }, [fetchAccounts]);

    const stats = useMemo(() => ({
        total: accounts.length,
        locked: accounts.filter(a => a.isLock).length,
        active: accounts.filter(a => !a.isLock).length,
    }), [accounts]);

    /* ── Actions ── */
    const handleLock = async (id: string) => {
        const ok = await waitConfirm();
        if (!ok) return;
        const res = await query<AccountRep>(lockAccount(id));
        if (res?.data) {
            showToast("Success", "Đã khóa tài khoản");
            setAccounts(prev => prev.map(a => a.id === id ? { ...a, isLock: true } : a));
        } else if (res?.errors) showErrorResponse(res.errors);
    };

    const handleUnlock = async (id: string) => {
        const ok = await waitConfirm();
        if (!ok) return;
        const res = await query<AccountRep>(activateAccount(id));
        if (res?.data) {
            showToast("Success", "Đã mở khóa tài khoản");
            setAccounts(prev => prev.map(a => a.id === id ? { ...a, isLock: false } : a));
        } else if (res?.errors) showErrorResponse(res.errors);
    };

    /* ── Filter ── */
    const filtered = useMemo(() => accounts.filter(a => {
        const kw = searchInput.toLowerCase();
        const matchSearch = !kw || a.id.toLowerCase().includes(kw) || a.email.toLowerCase().includes(kw);
        const matchRole = !roleFilter || a.role?.toUpperCase() === roleFilter;
        return matchSearch && matchRole;
    }), [accounts, searchInput, roleFilter]);

    const formatDate = (d: Date | string) => new Intl.DateTimeFormat("vi-VN").format(new Date(d));

    /* ── Table ── */
    const tableHead: TableHeader = ["# UID", "Email", "Role", "Trạng thái", "Ngày tạo", "Thao tác"];

    const tableBody: TableBody = filtered.map(acc => ([
        { reactNode: <div className="max-w-40 truncate text-xs font-mono" title={acc.id}>{acc.id}</div>, clipboard: acc.id },
        { reactNode: <div className="max-w-52 truncate text-sm" title={acc.email}>{acc.email}</div> },
        {
            reactNode: (
                <span className={`px-2 py-1 rounded text-xs ${acc.role?.toUpperCase() === "ADMIN" ? "text-blue-600 bg-blue-100" : "text-gray-600 bg-gray-100"}`}>
                    {acc.role?.toUpperCase() === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                </span>
            )
        },
        {
            reactNode: (
                <span className={`px-2 py-1 rounded text-xs font-medium ${!acc.isLock ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                    {!acc.isLock ? "Hoạt động" : "Bị khóa"}
                </span>
            )
        },
        formatDate(acc.createdAt),
        {
            reactNode: (
                <div className="flex items-center gap-1.5">
                    <button onClick={() => setSelectedAccountForEdit(acc)}
                        className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
                        Sửa
                    </button>
                    <button onClick={() => setResetTarget(acc)}
                        className="px-2 py-1 text-xs rounded border border-blue-300 text-blue-600 hover:bg-blue-50">
                        Đặt lại MK
                    </button>
                    {acc.isLock ? (
                        <button onClick={() => handleUnlock(acc.id)}
                            className="px-2 py-1 text-xs rounded border border-green-300 text-green-600 hover:bg-green-50">
                            Mở khóa
                        </button>
                    ) : (
                        <button onClick={() => handleLock(acc.id)}
                            className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50">
                            Khóa
                        </button>
                    )}
                </div>
            )
        },
    ]));

    return (
        <div className="px-8 pt-5 space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-blue-700 text-2xl font-semibold">Account management</h1>
                    <p className="text-gray-500 text-sm">Quản lý tài khoản người dùng trong hệ thống</p>
                </div>
                <button onClick={() => setShowAddAccount(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm ring-2 ring-blue-600 hover:bg-white hover:text-blue-600 transition">
                    <i className="fa-solid fa-user-plus" />
                    <span>Thêm tài khoản</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-5">
                <Stats icon={<i className="fa-regular fa-rectangle-list" />} title="Tổng tài khoản" des={`${stats.total} tài khoản`} />
                <Stats icon={<i className="fa-solid fa-lock-open" />} iconColor="text-green-600" iconBg="bg-green-100" title="Hoạt động" des={`${stats.active} tài khoản`} />
                <Stats icon={<i className="fa-solid fa-lock" />} iconColor="text-red-600" iconBg="bg-red-100" title="Bị khóa" des={`${stats.locked} tài khoản`} />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <InputSearch searchInput={searchInput} setSearchInput={setSearchInput} opts={{ width: "w-74" }} />
                <div className="ring-1 ring-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-600">
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                        className="text-sm text-gray-700 focus:outline-none bg-transparent">
                        <option value="">Tất cả vai trò</option>
                        <option value="ADMIN">Quản trị viên</option>
                        <option value="USER">Người dùng</option>
                    </select>
                </div>
                <span className="ml-auto text-xs text-gray-400">{filtered.length} tài khoản</span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-10 text-gray-400 text-sm">Đang tải dữ liệu...</div>
            ) : (
                <Table tableHead={tableHead} tableBody={tableBody} />
            )}

            {/* Modals */}
            {showAddAccount && (
                <AddAccount
                    onAccountAdded={acc => setAccounts(prev => [...prev, acc])}
                    onClose={() => setShowAddAccount(false)}
                />
            )}
            {selectedAccountForEdit && (
                <EditAccount
                    account={selectedAccountForEdit}
                    onClose={() => setSelectedAccountForEdit(null)}
                    onUpdated={updated => {
                        setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
                        setSelectedAccountForEdit(null);
                    }}
                />
            )}
            {resetTarget && (
                <ResetPasswordModal
                    account={resetTarget}
                    onClose={() => setResetTarget(null)}
                    onSuccess={() => setResetTarget(null)}
                />
            )}
        </div>
    );
};

export default AdminAccount;
