
import { useState, useEffect, useCallback, act } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";
import { getAllAccounts, type AccountRep } from "../../../services/account";
import { useExecute } from "../../../hooks/execute";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import AddAccount from "../../../components/add/account/add-account";
import EditAccount from "../../../components/edit/account/edit-account"; 9
import { useModalConfirmContext } from "../../../contexts/modal-confirm/modal-confirm";

const AdminAccount = () => {
    const { query, loading } = useExecute();
    const [accounts, setAccounts] = useState<AccountRep[]>([]);
    const [stats, setStats] = useState({
        totalAccounts: 0,
        activeAccounts: 0,
        lockedAccounts: 0,
    });

    const fetchAccounts = useCallback(async () => {
        const response = await query<AccountRep[]>(getAllAccounts());
        if (response && response.data) {
            setAccounts(response.data);
        }
    }, []);

    useEffect(() => {
        void fetchAccounts();
    }, []);

    useEffect(() => {
        const total = accounts.length;
        const locked = accounts.filter(acc => acc.isLock).length;
        const active = total - locked;
        setStats({
            totalAccounts: total,
            activeAccounts: active,
            lockedAccounts: locked,
        });
    }, [accounts]);


    const [searchInput, setSearchInput] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<string>("");

    const [showAddAccount, setShowAddAccount] = useState<boolean>(false);
    const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<AccountRep | null>(null);

    const handleDeactivateAccount = async (id: string) => {

    }

    const handleActivateAccount = async (id: string) => {
       
    }

    const handleAccountAdded = (newAccount: AccountRep) => {
        setAccounts(prev => [...prev, newAccount]);
    }

    const formatDate = (date: Date | string) => {
        if (!date) return "";
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("vi-VN").format(dateObj);
    };

    const tableHead: TableHeader = ["# UID", "Email", "Role", "Status", "Create date", "Actions"];
    const tableBody: TableBody = accounts.map((account) => ([
        {
            reactNode: (
                <div
                    className="max-w-45 truncate"
                    title={account.id}
                >
                    {account.id}
                </div>
            ),
            clipboard: account.id
        },
        {
            reactNode: (
                <div
                    className="max-w-50 truncate"
                    title={account.email}
                >
                    {account.email}
                </div>
            )
        },
        {
            reactNode: (
                <div    >
                    <span className={`px-2 py-1 rounded ${account.role?.toUpperCase() === "ADMIN" ? "text-blue-600 bg-blue-100" : "text-gray-600 bg-gray-100"}`}>
                        {account.role?.toUpperCase() === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                    </span>
                </div>
            )
        },
        {
            reactNode: (
                <div
                    onClick={() =>
                        account.isLock
                            ? handleActivateAccount(account.id)
                            : handleDeactivateAccount(account.id)
                    }
                    className="cursor-pointer"
                >
                    <span
                        className={`px-2 py-1 rounded ${!account.isLock
                            ? "text-green-600 bg-green-100"
                            : "text-red-600 bg-red-100"
                            }`}
                    >
                        {!account.isLock ? "Hoạt động" : "Khóa"}
                    </span>
                </div>
            )
        },
        formatDate(account.createdAt),
        {
            reactNode: (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedAccountForEdit(account)}
                        className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50">Sửa</button>
                    {account.isLock ? (
                        <button
                            onClick={() => handleActivateAccount(account.id)}
                            className="px-2 py-1 text-xs rounded border border-green-300 text-green-600 hover:bg-green-50"
                        >
                            Mở khóa
                        </button>
                    ) : (
                        <button
                            onClick={() => handleDeactivateAccount(account.id)}
                            className="px-2 py-1 text-xs rounded ring-1 ring-red-300 text-red-600 hover:bg-red-50"
                        >
                            Khóa
                        </button>
                    )}
                </div>
            )
        },
    ]));

    return (
        <div className="px-8 pt-5 space-y-5">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-blue-700 text-2xl font-semibold">Account management</h1>
                    <p className="text-gray-500 text-sm">Quản lý tài khoản người dùng có trong hệ thống</p>
                </div>

                <div className="flex gap-3 items-center">
                    <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring-2 
                            text-sm ring-gray-300">
                        <i className="fa-solid fa-arrow-up-from-bracket"></i>
                        <span>Xuất file</span>
                    </button>

                    <button
                        onClick={() => setShowAddAccount(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded
                            text-sm ring-2 ring-blue-600 hover:bg-white hover:text-blue-600 transition">
                        <i className="fa-solid fa-user-plus"></i>
                        <span>Thêm tài khoản</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-5">
                <Stats
                    icon={<i className="fa-regular fa-rectangle-list"></i>}
                    title="Tổng số tài khoản"
                    des={`${stats.totalAccounts} tài khoản`} />

                <Stats
                    icon={<i className="fa-solid fa-lock"></i>}
                    iconColor="text-red-600"
                    iconBg="bg-red-100"
                    title="Tài khoản bị khóa"
                    des={`${stats.lockedAccounts} tài khoản`} />

                <Stats
                    icon={<i className="fa-solid fa-lock-open"></i>}
                    iconColor="text-green-600"
                    iconBg="bg-green-100"
                    title="Tài khoản hoạt động"
                    des={`${stats.activeAccounts} tài khoản`} />
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <InputSearch searchInput={searchInput} setSearchInput={setSearchInput} opts={{ width: "w-74" }} />

                    <div>
                        {/* Search option */}
                        <div>
                            <div className="ring-1 rounded py-1 px-2 ring-gray-300 flex items-center w-60">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full none-input text-sm py-1">
                                    <option value="">Tất cả</option>
                                    <option value="ADMIN">Quản trị viên</option>
                                    <option value="USER">Người dùng</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div>
                        <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring 
                                text-sm ring-gray-300">
                            <i className="fa-solid fa-arrow-down-wide-short"></i>
                            <span>Bộ lọc</span>
                        </button>

                        <div>

                        </div>
                    </div>

                    <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring 
                                text-sm ring-gray-300">
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </div>
            </div>

            <div>
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        <Table
                            tableHead={tableHead}
                            tableBody={tableBody}
                        />
                    </>
                )}
            </div>

            {showAddAccount && (
                <AddAccount
                    onAccountAdded={handleAccountAdded}
                    onClose={() => setShowAddAccount(false)}
                />
            )}

            {selectedAccountForEdit && (
                <EditAccount
                    account={selectedAccountForEdit}
                    onClose={() => setSelectedAccountForEdit(null)}
                    onUpdated={(updated) => {
                        setAccounts(prev =>
                            prev.map(acc =>
                                acc.id === updated.id ? updated : acc
                            )
                        );
                        setSelectedAccountForEdit(null);
                    }}
                />
            )}
        </div>
    )
}

export default AdminAccount;
