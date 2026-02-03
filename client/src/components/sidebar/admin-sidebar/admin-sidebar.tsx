import { useEffect, useState } from "react";
import logo from "../../../assets/icons/logo-sidebar.png";
import type { AdminActivity } from "../sidebar-define";

const AdminSidebar = ({ isOpenSidebar, setIsOpenSidebar }: { isOpenSidebar: boolean, setIsOpenSidebar: (v: boolean) => void }) => {
    const [urlPrams, setUrlParams] = useState<string>("");
    const [activities, setActivities] = useState<AdminActivity[]>([
        {
            title: "Trang chủ",
            items: [
                {
                    icon: "fa-solid fa-table-cells-large",
                    des: "Dashboard",
                    url: "dashboard"
                }
            ]
        },
        {
            title: "Quản lý",
            items: [
                {
                    icon: "fa-solid fa-user",
                    des: "Tài khoản",
                    url: "accounts",
                },
                {
                    icon: "fa-solid fa-box-archive",
                    des: "Sản phẩm",
                    url: 'products'
                },
                {
                    icon: "fa-solid fa-mattress-pillow",
                    des: "Thuộc tính",
                    children: {
                        isActive: false,
                        items: [
                            {
                                des: "Danh mục sản phẩm",
                                url: ""
                            },
                            {
                                des: "Thẻ sản phẩm",
                                url: ""
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: "Hóa đơn",
            items: [
                {
                    icon: "fa-solid fa-box-tissue",
                    des: "Nhập hàng",
                    url: ""
                },
                {
                    icon: "fa-solid fa-file-export",
                    des: "Xuất hàng",
                    url: ""
                }
            ]
        },
        {
            title: "Cổng thanh toán",
            items: [
                {
                    icon: "fa-solid fa-building-columns",
                    des: "VNPay",
                    url: ""
                },
                {
                    icon: "fa-solid fa-s",
                    des: "Seapay",
                    url: ""
                },
                {
                    icon: "fa-solid fa-m",
                    des: "Momo",
                    url: ""
                },
            ]
        }
    ]);

    const toggleChildren = (activityIdx: number, itemIdx: number) => {
        const newActivities = activities.map((activity, aIdx) => {
            if (aIdx === activityIdx) {
                return {
                    ...activity,
                    items: activity.items?.map((item, iIdx) => {
                        if (iIdx === itemIdx && item.children) {
                            return {
                                ...item,
                                children: {
                                    ...item.children,
                                    isActive: !item.children.isActive
                                }
                            };
                        }
                        return item;
                    })
                };
            }
            return activity;
        });
        setActivities(newActivities);
    }

    useEffect(() => {
        const param = window.location.href;
        const path = param.split("/admin/")
        setUrlParams(path[path.length - 1]);
        console.log(path[path.length - 1])
    }, []);

    return (
        <div className={`fixed md:sticky top-0 start-0 w-full sm:w-60 h-screen bg-[#191919] px-4 shadow flex flex-col
        ${isOpenSidebar ? "block" : "hidden"}`}>
            <div className="flex justify-between items-center py-3">
                <img src={logo} alt="" className="w-40" />
                <button className="md:hidden text-gray-300 hover:text-white w-8 h-8"
                    onClick={() => setIsOpenSidebar(false)}
                >
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {activities.map((activity, actIdx) => (
                    <div key={actIdx} className="text-gray-300">
                        <div className="flex items-center gap-2 pb-3">
                            <h1 className="flex-2">{activity.title}</h1>
                            {/* <hr className="border-gray-400 border flex-1" /> */}
                        </div>

                        <div className="space-y-1">
                            {activity.items && activity.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="w-full">
                                    <div>
                                        {item.children ? (
                                            // items have children items
                                            <div className="overflow-hidden">
                                                {/* Inline [icon - title] - [toogle] */}
                                                <div className="w-full flex justify-between px-2 py-2 bg-[#191919] relative z-1 
                                                hover:bg-[#262626] rounded cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        {item.icon && (
                                                            <i className={`${item.icon}`}></i>
                                                        )}
                                                        <span>{item.des}</span>
                                                    </div>
                                                    <div onClick={() => toggleChildren(actIdx, itemIdx)}>
                                                        <button>
                                                            {item.children.isActive && (<i className="fa-solid fa-angle-up"></i>)}
                                                            {!item.children.isActive && (<i className="fa-solid fa-angle-down"></i>)}
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* List - items's children. Open when isActive = true */}
                                                {item.children.isActive && (
                                                    <div className="activate-children relative z-0 ps-3">
                                                        {item.children.items && item.children.items.map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex gap-2 activate-children px-2 py-2 
                                                                hover:bg-[#262626] rounded cursor-pointer">
                                                                <div>
                                                                    <div className="w-px h-3 bg-white"></div>
                                                                    <div className="w-3 h-px bg-white"></div>
                                                                    <div className=""></div>
                                                                </div>
                                                                <div>
                                                                    <span>{item.des}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // items haven't children items
                                            <div>
                                                <a href={item.url}
                                                    className={`flex items-center gap-1 px-2 py-2 rounded transition-all duration-200
                                                    ${urlPrams.includes(item.url!) && item.url ? "bg-[#006AFF] text-white font-semibold" : "hover:bg-[#262626]"}`}>
                                                    {item.icon && (
                                                        <i className={`${item.icon}`}></i>
                                                    )}
                                                    <span>{item.des}</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center py-3">
                <button className="text-white bg-[#474747] w-full py-2 rounded hover:bg-[#555555]">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    )
}

export default AdminSidebar;