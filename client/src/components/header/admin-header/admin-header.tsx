const AdminHeader = ({ setIsOpenSidebar }: { setIsOpenSidebar: (v: boolean) => void }) => {

    return (
        <div className="bg-white shadow mb-1">
            <div className="flex justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                    <button className="bg-white ring-1 items-center justify-center ring-gray-500 
                    rounded w-6 h-6 text-sm hover:bg-gray-100 cursor-pointer
                    flex md:hidden"
                        onClick={() => setIsOpenSidebar(true)}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <span>
                        Admin Panel
                    </span>
                </div>
                <div className="flex gap-2 items-center">
                    <button className="bg-white ring-1 flex items-center justify-center ring-gray-500 
                    rounded w-6 h-6 text-sm hover:bg-gray-100 cursor-pointer">
                        <i className="fa-regular fa-bell"></i>
                    </button>
                    <button className="bg-white ring-1 flex items-center justify-center ring-gray-500 
                    rounded w-6 h-6 text-sm hover:bg-gray-100 cursor-pointer">
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdminHeader;