import { useState } from "react";
import InputSearch from "../../../components/input/input-search/input-search";
import Stats from "../../../components/stats/stats";
import Table from "../../../components/table/table";

const AdminAccount = () => {
    const [searchInput, setSearchInput] = useState<string>("");


    const accounts = [
        {
            uid: "64b8f2c9e4a1b23d4f9a7c12",
            email: "nguyennamduong205@gmail.com",
            role: "Admin",
            status: "Active",
            createDate: "20/01/2026",
        },
        {
            uid: "64b8f2c9e4a1b23d4f9a7c12",
            email: "nguyennamduong@gmail.com",
            role: "User",
            status: "Active",
            createDate: "20/01/2026",
        },
        {
            uid: "64b8f2c9e4a1b23d4f9a7c12",
            email: "nguyennamduong.it@gmail.com",
            role: "Admin",
            status: "Lock",
            createDate: "20/01/2026",
        }
    ]

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

                    <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded
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
                    des="10 tài khoản" />

                {/* Add more stats */}

                <Stats
                    icon={<i className="fa-solid fa-lock"></i>}
                    iconColor="text-red-600"
                    iconBg="bg-red-100"
                    title="Tổng số tài khoản"
                    des="10 tài khoản" />
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
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring 
                            text-sm ring-gray-300">
                        <i className="fa-solid fa-arrow-down-wide-short"></i>
                        <span>Bộ lọc</span>
                    </button>

                    <button className="flex items-center gap-2 bg-white px-3 py-1 rounded ring 
                            text-sm ring-gray-300">
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </div>
            </div>

            <div>
                <Table
                    tableHead={[ "# UID", "Email", "Role", "Status", "Create date", "Actions" ]}
                    tableBody={[]} />
            </div>
        </div>
    )
}

export default AdminAccount;