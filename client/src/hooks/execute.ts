import { useState, useCallback } from "react"
import type { AxiosResponse } from "axios";

type RestError = string | string[] | null;

type QueryRespsonse<T> = { data: T | null, errors: RestError } | null;


/**
 * hello for (luky)
 */
export const useExecute = () => {
    const [loading, setLoading] = useState<boolean>(false);


    const query = useCallback(async <T = any>(promiseFunc: Promise<AxiosResponse<T>>): Promise<QueryRespsonse<T>> => {
        try {
            setLoading(true);

            const result = await promiseFunc;

            if (result && result.data) {
                setLoading(false);
                // Server wraps all responses as { statusCode, message, data, error }
                // Unwrap one level: result.data = { statusCode, message, data: T, error }
                const envelope = result.data as any;
                const responseData = envelope.data !== undefined ? envelope.data : envelope;

                return {
                    data: responseData as T,
                    errors: null
                }
            }

        } catch (error: any) {
            setLoading(false);
            return {
                data: null,
                errors: error?.error
            }
        }
        return null;
    }, []);

    return { loading, query }
}