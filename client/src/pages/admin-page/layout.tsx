import { Outlet } from "react-router";
import AdminSidebar from "../../components/sidebar/admin-sidebar/admin-sidebar";
import AdminHeader from "../../components/header/admin-header/admin-header";
import { useState } from "react";

const AdminLayout = () => {
    const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(true);

    return (
        <div className="flex h-screen">
            <AdminSidebar isOpenSidebar={isOpenSidebar} setIsOpenSidebar={setIsOpenSidebar} />
            <div className="flex-1 overflow-y-auto">
                <AdminHeader setIsOpenSidebar={setIsOpenSidebar} />
                <div className="bg-white h-full">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AdminLayout;