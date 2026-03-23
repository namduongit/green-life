import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const url = import.meta.env.VITE_SERVER_URL;

const api = axios.create({
    baseURL: url
});


api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const stored = localStorage.getItem("STATE_USER");
    if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.accessToken) {
            config.headers.Authorization = `Bearer ${parsed.accessToken}`;
        }
    }
    return config;
});

api.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        async (error: AxiosError) => {
            if (error.response?.data) {
                return Promise.reject(error.response.data);
            }
            return Promise.reject(error);
        }
    )

export { api };