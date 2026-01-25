import { api } from "../../api/api"
import type { LoginRep, RegisterRep } from "./auth.type";

export const login = async (loginForm: { email: string, password: string}) => {
    const response = await api.post("/auth/login", loginForm);
    return response.data as LoginRep;
}

export const register = async (registerForm: { email: string, password: string, passwordConfirm: string}) => {
    const response = await api.post("/auth/register", registerForm);
    return response.data as RegisterRep;
}