import { NavLink } from "react-router";
import logo from "../../assets/icons/logo-header.svg";
import CartIcon from "../cart-icon/cart-icon";
import SideBar from "../sidebar/sidebar";
import { useState } from "react";
import AuthIcon from "../auth-icon/auth-icon";

const Header = () => {
    const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(false);

    return (
        <header className="py-3 bg-white shadow px-3 md:px-5 lg:px-0">
            <div className="container mx-auto flex items-center">
                <div className="md:hidden flex-1 text-2xl" onClick={() => setIsOpenSidebar(true)}>
                    <i className="fa-solid fa-list"></i>
                </div>

                <div className="flex-1 flex justify-center md:block">
                    <a href="/">
                        <img src={logo} alt="" className="w-15 h-15 md:w-25 md:h-25" />
                    </a>
                </div>

                <div className="flex-4 hidden md:block">
                    <nav className="flex justify-center font-bold text-lg">
                        <ul className="flex gap-5">
                            <li>
                                <NavLink className={({ isActive: act }) => {
                                    return act ? "border-b-2" : ''
                                }} to="">
                                    Trang chủ
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className={({ isActive: act }) => {
                                    return act ? "border-b-2" : ''
                                }} to="/page/about">
                                    Về GREENLIFE
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className={({ isActive: act }) => {
                                    return act ? "border-b-2" : ''
                                }} to="/page/product">
                                    Sản phẩm
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className={({ isActive: act }) => {
                                    return act ? "border-b-2" : ''
                                }} to="/page/image">
                                    Hình ảnh
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className={({ isActive: act }) => {
                                    return act ? "border-b-2" : ''
                                }} to="/page/testing">
                                    Kiểm nghiệm
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className={({ isActive: act }) => {
                                    return act ? "border-b-2" : ''
                                }} to="/page/e-catologue">
                                    E-Catologue
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="flex-1 flex gap-3 text-lg justify-end">
                    <AuthIcon />
                    <div className="hidden md:block">
                        <i className="fa-regular fa-heart"></i>
                    </div>
                    <CartIcon />
                </div>
            </div>

            <SideBar isOpenSidebar={isOpenSidebar} setIsOpenSidebar={setIsOpenSidebar} />
        </header>
    )
}

export default Header;