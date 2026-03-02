import { useState } from "react"
import type { AxiosResponse } from "axios";

type RestError = string | string[] | null;

type QueryRespsonse<T> = { data: T | null, errors: RestError } | null;


/**
 * hello for (luky)
 */
export const useExecute = () => {
    const [loading, setLoading] = useState<boolean>(false);


    const query = async <T>(promiseFunc: Promise<AxiosResponse>): Promise<QueryRespsonse<T>> => {
        try {
            setLoading(true);

            const result = await promiseFunc;
            console.log(result)
            if (result.data) {
                setLoading(false);
                return {
                    data: result.data.data,
                    errors: null
                }
            }

        } catch (error: any) {
            console.log(error)
            setLoading(false);
            return {
                data: null,
                errors: error.error
            }
        }
        return null;
    }

    return { loading, query }
}