import { useState } from "react";
import { NavLink } from "react-router";

const SideBar = ({ isOpenSidebar, setIsOpenSidebar }: { isOpenSidebar: boolean, setIsOpenSidebar: (v: boolean) => void }) => {
    const [searchInput, setSearchInput] = useState<string>("");
    const [isAuth, setIsAuth] = useState<boolean>(false);

    const closeSidebar = () => {
        setIsOpenSidebar(false);
        setIsAuth(false);
    }

    if (!isOpenSidebar) return;

    return (
        <div className="absolute top-0 left-0 w-full h-screen bg-gray-800/60">
            {!isAuth && (
                <div className="slide-to-left fixed top-0 start-0 w-full sm:w-80 h-screen bg-white me-auto">
                    <div className="h-18 shadow-md flex items-center">
                        <input type="text" placeholder="Tìm kiếm sản phẩm" className="w-full px-5 none-input"
                            value={searchInput} onChange={(event) => setSearchInput(event.target.value)}
                        />
                        <div className="flex pe-5 text-gray-500">
                            {searchInput !== "" && (
                                <div className="border-r pe-2"
                                    onClick={() => setSearchInput("")}
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </div>
                            )}
                            <div className={`${searchInput !== "" && "ps-2"}`}>
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between h-full">
                        <nav>
                            <ul className="font-normal text-md">
                                <li className="py-4 ps-5 border-b border-gray-300">
                                    <NavLink className={({ isActive: act }) => {
                                        return act ? "text-green-700" : ""
                                    }} to="">TRANG CHỦ</NavLink>
                                </li>
                                <li className="py-4 ps-5 border-b border-gray-300">
                                    <NavLink className={({ isActive: act }) => {
                                        return act ? "text-green-700" : ""
                                    }} to="/page/about">VỀ GREENLIFE</NavLink>
                                </li>
                                <li className="py-4 ps-5 border-b border-gray-300">
                                    <NavLink className={({ isActive: act }) => {
                                        return act ? "text-green-700" : ""
                                    }} to="/page/product">SẢN PHẨM</NavLink>
                                </li>
                                <li className="py-4 ps-5 border-b border-gray-300">
                                    <NavLink className={({ isActive: act }) => {
                                        return act ? "text-green-700" : ""
                                    }} to="/page/image">HÌNH ẢNH</NavLink>
                                </li>
                                <li className="py-4 ps-5 border-b border-gray-300">
                                    <NavLink className={({ isActive: act }) => {
                                        return act ? "text-green-700" : ""
                                    }} to="/page/testing">KIỂM NGHIỆM</NavLink>
                                </li>
                                <li className="py-4 ps-5 border-b border-gray-300">
                                    <NavLink className={({ isActive: act }) => {
                                        return act ? "text-green-700" : ""
                                    }} to="/page/e-catologue">E-CATOLOGUE</NavLink>
                                </li>
                                <li className="py-4 ps-5 border-b border-gray-300 flex items-center gap-1"
                                    onClick={() => setIsAuth(!isAuth)}
                                >
                                    <i className="fa-regular fa-user"></i>
                                    <span>LOGIN/REGISTER</span>
                                </li>

                                <li className="py-4 ps-5 border-b border-gray-300 flex items-center gap-1"
                                    onClick={closeSidebar}
                                >
                                    <span>ĐÓNG</span>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}

            {isAuth && (
                <div className="w-full sm:w-80 h-screen bg-white ms-auto">
                    <div className="flex justify-between items-center py-4 px-5 border-b border-gray-300">
                        <h1 className="text-green-700 text-xl font-semibold">Đăng nhập</h1>
                        <div className="flex items-center gap-1 text-md text-gray-600" onClick={closeSidebar}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                    </div>

                    <div className="px-4 space-y-3 py-5 border-b-2 border-gray-300">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="" className="text-lg after:content-['*'] after:text-red-700">Địa chỉ Email</label>
                            <div className="ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-green-700">
                                <input type="text" className="ps-3 py-2 w-full none-input" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="" className="text-lg after:content-['*'] after:text-red-700">Mật khẩu</label>
                            <div className="ring-1 ring-gray-400 rounded-lg focus-within:ring-2 focus-within:ring-green-700">
                                <input type="text" className="ps-3 py-2 w-full none-input" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => {
                                alert("Ấn nút quên mật khẩu")
                            }}>Quên mật khẩu</button>
                        </div>
                        <div>
                            <button className="px-4 bg-green-700 text-white py-2 w-full rounded text-lg">Đăng nhập</button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center py-5 gap-2">
                        <div className="text-4xl text-gray-500">
                            <i className="fa-regular fa-user"></i>
                        </div>
                        <div className="text-lg font-normal">
                            <span>Bạn chưa có tài <keygen />hoản</span>
                        </div>
                        <div className="border-b">
                            TẠO TÀI KHOẢN ⭢
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SideBar;