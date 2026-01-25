import axios from "axios";

type RestResponse = {
    statusCode: number,
    message: string,
    error: string | string[],
    data: any
}

const url = import.meta.env.VITE_SERVER_URL;

const api = axios.create({
    baseURL: url
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: any) => {
        /** Error network */
        if (!error.data) {
            error.data = {
                statusCode: 400,
                message: "Bad Request",
                error: "Error network",
                data: null
            } as RestResponse
        }
        /** Catch any error */
        console.log(error);
        return error;
    }   
);

export { api };