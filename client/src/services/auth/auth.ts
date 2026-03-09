<<<<<<< HEAD
import { api } from "../../lib/api/api"
=======
import { api } from "../../api/api"
import type { LoginRep } from "./auth.type";
>>>>>>> f69e5af (Them type, dùng query, thêm chức năng mở khoá, fix lại UI cho chức năng thêm sản phẩm, lưu ý là phải xem lại phân trang cho phần product)

export const login = async (loginForm: { email: string, password: string}) => {
    const response = await api.post<LoginRep>("/auth/login", loginForm);
    return response  ;
}

export const register = async (registerForm: { email: string, password: string, passwordConfirm: string}) => {
    const response = await api.post("/auth/register", registerForm);
    return response;
}