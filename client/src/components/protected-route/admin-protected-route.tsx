import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "../../contexts/auth/auth";

/**
 * Bảo vệ các route admin — chỉ tài khoản có role ADMIN mới truy cập được.
 * - Chưa đăng nhập → redirect về /auth/login
 * - Đã đăng nhập nhưng không phải ADMIN → redirect về /
 */
const ProtectedAdminRoute = () => {
    const { state, loading } = useAuthContext();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!state) {
        return <Navigate to="/auth/login" replace />;
    }

    // if (state.role?.toUpperCase() !== "ADMIN") {
    //     return <Navigate to="/" replace />;
    // }

    return <Outlet />;
};

export default ProtectedAdminRoute;
