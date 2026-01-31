import { Outlet } from "react-router";
import PublicHeader from "../components/header/public-header/public-header";
import Footer from "../components/footer/footer";

const Layout = () => {
    return (
        <>
            <PublicHeader />
            <Outlet />
            <Footer />
        </>
    )
}

export default Layout;