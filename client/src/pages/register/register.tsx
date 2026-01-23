import { useState } from "react";

const RegisterPage = () => {
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false);

    return (
        <div className="pb-15">
            <div className="bg-black text-white flex flex-col items-center py-8 lg:py-12 gap-3">
                <h1 className="text-2xl lg:text-6xl font-semibold">Trang đăng ký tài khoản</h1>
                <span className="flex gap-2">
                    <p>Trang chủ</p>
                    <p>/</p>
                    <p>Trang đăng ký</p>
                </span>
            </div>
            <div className="flex flex-col lg:flex-row lg-container mx-auto py-10 px-5 xl:px-0">
                <div className="flex-1 space-y-4 lg:pe-15 lg:border-e lg:border-gray-300">
                    <h1 className="text-2xl text-green-700 font-semibold">ĐĂNG KÝ</h1>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="" className="text-green-700 font-medium after:content-['*'] after:text-red-700">Tài khoản Email</label>
                            <div className="px-3 ring-2 ring-gray-400 rounded-lg focus-within:ring-3 focus-within:ring-green-700
                                            flex items-center">
                                <i className="fa-solid fa-user text-gray-600"></i>
                                <input type="text" className="none-input ps-2 py-2 w-full" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="" className="text-green-700 font-medium after:content-['*'] after:text-red-700">Mật khẩu</label>
                            <div className="px-3 ring-2 ring-gray-400 rounded-lg focus-within:ring-3 focus-within:ring-green-700
                                            flex items-center">
                                <i className="fa-solid fa-key text-gray-600"></i>
                                <input type={`${isShowPassword ? "text": "password"}`} className="none-input ps-2 py-2 w-full" />
                                <i className={`fa-solid ${isShowPassword ? "fa-eye" : "fa-eye-slash"} text-gray-600 cursor-pointer`}
                                    onClick={() => setIsShowPassword(!isShowPassword)}
                                ></i>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="" className="text-green-700 font-medium after:content-['*'] after:text-red-700">Xác nhận mật khẩu</label>
                            <div className="px-3 ring-2 ring-gray-400 rounded-lg focus-within:ring-3 focus-within:ring-green-700
                                            flex items-center">
                                <i className="fa-solid fa-key text-gray-600"></i>
                                <input type={`${isShowPassword ? "text": "password"}`} className="none-input ps-2 py-2 w-full" />
                                <i className={`fa-solid ${isShowPassword ? "fa-eye" : "fa-eye-slash"} text-gray-600 cursor-pointer`}
                                    onClick={() => setIsShowPassword(!isShowPassword)}
                                ></i>
                            </div>
                        </div>
                        <div>
                            <button className="text-white bg-green-700 py-2 w-full rounded-lg hover:bg-green-800">ĐĂNG KÝ</button>
                        </div>
                    </div>
                </div>
                <div className="lg:hidden flex items-center justify-center py-5 text-gray-500">
                    <hr className="w-35 md:w-80 border" />
                    <span className="px-5">OR</span>
                    <hr className="w-35 md:w-80 border" />
                </div>
                <div className="flex-1 text-center space-y-4 lg:ps-15 lg:border-s lg:border-gray-300">
                    <h1 className="text-2xl text-green-700 font-semibold">ĐĂNG NHẬP</h1>
                    <p className="font-light">
                        Đăng nhập để truy cập trạng thái và lịch sử đơn hàng của bạn.
                        Vui lòng nhập thông tin tài khoản đã đăng ký để tiếp tục.
                        Việc đăng nhập giúp bạn mua sắm nhanh chóng và quản lý đơn hàng dễ dàng hơn.
                    </p>
                    <button className="bg-white ring-2 ring-green-700 rounded-lg px-4 py-2 text-green-700 font-semibold 
                                        hover:after:content-['⭢'] hover:after:ps-2 hover:text-white hover:bg-green-700 animate-500ms">ĐĂNG NHẬP NGAY</button>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage;