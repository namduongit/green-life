import { api } from "../../api/api"
import type { LoginRep } from "./auth.type";

export const login = async (loginForm: { email: string, password: string}) => {
    const response = await api.post<LoginRep>("/auth/login", loginForm);
    return response  ;
}

export const register = async (registerForm: { email: string, password: string, passwordConfirm: string}) => {
    const response = await api.post("/auth/register", registerForm);
    return response;
}