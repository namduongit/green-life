import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";
import { useToastContext } from "../../contexts/toast-message/toast-message";

const AuthIcon = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const { state, clearStateAuth } = useAuthContext();
    const { showToast } = useToastContext();

    const closeDropdown = () => setIsOpen(false);

    const handleNavigate = (path: string) => {
        navigate(path);
        closeDropdown();
    };

    const handleLogout = () => {
        clearStateAuth();
        closeDropdown();
        showToast("Success", "Bạn đã đăng xuất khỏi hệ thống.");
    };

    return (
        <div className="hidden md:block relative">
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                <i className={`fa-regular fa-user text-lg hover:text-green-700 ${isOpen && "text-green-700"} transition-colors`}></i>
            </div>
            {isOpen && (
                <div className="absolute bg-white shadow-lg rounded px-4 py-6 min-w-64 -left-30 top-10 z-11 space-y-3">
                    <div className="absolute w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white -top-2 left-4"></div>
                    {!state && (
                        <>
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-700">Tài khoản</h3>
                                <NavLink
                                    className={"block w-full text-center py-2 rounded-lg font-medium bg-white text-green-700 ring-2 ring-green-700 hover:bg-green-50 transition-colors"}
                                    onClick={closeDropdown}
                                    to="/auth/login"
                                >
                                    Đăng Nhập
                                </NavLink>
                            </div>

                            <div className="flex items-center gap-2 text-gray-300">
                                <hr className="flex-1" />
                                <span className="text-xs text-gray-500">hoặc</span>
                                <hr className="flex-1" />
                            </div>

                            <div className="space-y-2">
                                <NavLink
                                    className={"block w-full text-center py-2 rounded-lg font-medium bg-green-700 text-white hover:bg-green-800"}
                                    to="/auth/register"
                                    onClick={closeDropdown}
                                >
                                    Đăng Ký Tài Khoản
                                </NavLink>
                            </div>
                        </>
                    )}

                    {state && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Xin chào</p>
                                <p className="text-sm font-semibold text-gray-800">{state.email}</p>
                            </div>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => handleNavigate("/page/info")}
                                    className="w-full text-left px-4 py-2 rounded-lg border border-green-600 text-green-700 font-medium hover:bg-green-50"
                                >
                                    Thông tin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleNavigate("/page/orders?tab=history")}
                                    className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 font-medium text-gray-700 hover:border-green-600 hover:text-green-700"
                                >
                                    Lịch sử
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AuthIcon;