import { api } from "../../lib/api/api"

export const login = async (loginForm: { email: string, password: string}) => {
    const response = await api.post("/auth/login", loginForm);
    return response;
}

export const register = async (registerForm: { email: string, password: string, passwordConfirm: string}) => {
    const response = await api.post("/auth/register", registerForm);
    return response;
}