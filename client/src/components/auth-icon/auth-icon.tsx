import { useState } from "react";
import { NavLink } from "react-router";

const AuthIcon = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <div className="hidden md:block relative">
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                <i className={`fa-regular fa-user text-lg hover:text-green-700 ${isOpen && "text-green-700"} transition-colors`}></i>
            </div>
            {isOpen && (
                <div className="absolute bg-white shadow-lg rounded px-4 py-6 min-w-64 left-0 top-10 z-11 space-y-3">
                    <div className="absolute w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white -top-2 left-4"></div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Tài khoản</h3>
                        <NavLink 
                            className={"block w-full text-center py-2 rounded-lg font-medium bg-white text-green-700 ring-2 ring-green-700 hover:bg-green-50 transition-colors"}
                            onClick={() => setIsOpen(false)}
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
                            onClick={() => setIsOpen(false)}
                        >
                            Đăng Ký Tài Khoản
                        </NavLink>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AuthIcon;