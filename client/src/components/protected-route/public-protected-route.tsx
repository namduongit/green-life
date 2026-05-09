import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";

/**
 * Bảo vệ các route công khai (login, register).
 * - Đã đăng nhập → redirect về trang chủ
 * - Chưa đăng nhập → cho vào bình thường
 */
const ProtectedPublicRoute = () => {
    const { state, loading } = useAuthContext();

    if (loading) return null; // Chờ kiểm tra auth xong trước khi quyết định

    if (state) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedPublicRoute;
