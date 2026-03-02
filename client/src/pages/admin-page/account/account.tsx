import { useState, useEffect } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";
import type { TableBody, TableHeader } from "../../../components/table/table";
import { getAllAccounts, deleteAccount, type AccountRep } from "../../../services/account";
import { useExecute } from "../../../hooks/execute";
import { useToastContext } from "../../../contexts/toast-message/toast-message";
import AddAccount from "../../../components/add/account/add-account";

const AdminAccount = () => {
    const [searchInput, setSearchInput] = useState<string>("");
    const [accounts, setAccounts] = useState<AccountRep[]>([]);
    const [filteredAccounts, setFilteredAccounts] = useState<AccountRep[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalAccounts, setTotalAccounts] = useState<number>(0);
    const [lockedAccounts, setLockedAccounts] = useState<number>(0);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);

    const { query } = useExecute();
    const { showToast, showErrorResponse } = useToastContext();

    // Fetch accounts on component mount
    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            const result = await query<AccountRep[]>(getAllAccounts());
            if (result?.errors) {
                showErrorResponse(result.errors);
            } else if (result?.data) {
                setAccounts(result.data);
                setFilteredAccounts(result.data);
                setTotalAccounts(result.data.length);
                setLockedAccounts(result.data.filter(acc => acc.isLock).length);
            }
            setLoading(false);
        };
        fetchAccounts();
    }, []);

    // Filter accounts based on search input
    useEffect(() => {
        const filtered = accounts.filter(account =>
            account.email.toLowerCase().includes(searchInput.toLowerCase()) ||
            account.id.toLowerCase().includes(searchInput.toLowerCase())
        );
        setFilteredAccounts(filtered);
    }, [searchInput, accounts]);

    const handleDeleteAccount = async (id: string) => {

    }

    const handleAccountAdded = (newAccount: AccountRep) => {
        setAccounts([...accounts, newAccount]);
        setTotalAccounts(totalAccounts + 1);
        setShowAddModal(false);
    }

    const formatDate = (date: Date | string) => {
        if (!date) return "";
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("vi-VN").format(dateObj);
    };

    const tableHead: TableHeader = ["# UID", "Email", "Role", "Status", "Create date", "Actions"];
    const tableBody: TableBody = filteredAccounts.map((account) => ([
        { string: { content: account.id }, clipboard: account.id },
        account.email,
        {
            reactNode: (
                <div>
                    <span className={`px-2 py-1 rounded ${account.role?.toUpperCase() === "ADMIN" ? "text-blue-600 bg-blue-100" : "text-gray-600 bg-gray-100"}`}>
                        {account.role?.toUpperCase() === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                    </span>
                </div>
            )
        },
        {
            reactNode: (
                <div onClick={() => handleDeleteAccount(account.id)}>
                    <span className={`px-2 py-1 rounded ${!account.isLock ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>
                        {!account.isLock ? "Hoạt động" : "Khóa"}
                    </span>
                </div>
            )
        },
        formatDate(account.createdAt),
        {
            reactNode: (
                <div className="flex items-center gap-2">
                    <button className="px-2 py-1 text-xs rounded ring-1 ring-gray-300 hover:bg-gray-50">Sửa</button>
                    <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="px-2 py-1 text-xs rounded ring-1 ring-red-300 text-red-600 hover:bg-red-50"
                    >
                        Khóa
                    </button>
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
                        onClick={() => setShowAddModal(true)}
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
                    des={`${totalAccounts} tài khoản`} />

                <Stats
                    icon={<i className="fa-solid fa-lock"></i>}
                    iconColor="text-red-600"
                    iconBg="bg-red-100"
                    title="Tài khoản bị khóa"
                    des={`${lockedAccounts} tài khoản`} />
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <InputSearch searchInput={searchInput} setSearchInput={setSearchInput} opts={{ width: "w-74" }} />

                    <div>
                        {/* Search option */}
                        <div>
                            <div className="ring-1 rounded py-1 px-2 ring-gray-300 flex items-center w-60">
                                <select className="w-full none-input text-sm py-1">
                                    <option value="">Tất cả</option>
                                    <option value="admin">Quản trị viên</option>
                                    <option value="user">Người dùng</option>
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
                    <Table
                        tableHead={tableHead}
                        tableBody={tableBody}
                    />
                )}
            </div>

            {showAddModal && (
                <AddAccount
                    onAccountAdded={handleAccountAdded}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>
    )
}

export default AdminAccount;