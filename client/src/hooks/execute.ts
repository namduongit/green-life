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
                // Handle nested data structure: {data: {data: T, pagination: ...}} or {data: T}
                let responseData = (result.data as any).data ?? result.data;
                
                // If responseData is still an object with .data property that contains the actual array
                if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && 'data' in responseData) {
                    responseData = responseData.data;
                }
                
                return {
                    data: responseData as T,
                    errors: null
                }
            }

        } catch (error: any) {
            setLoading(false);
            return {
                data: null,
                errors: error?.response?.data?.error || error.message
            }
        }
        return null;
    }, []);

    return { loading, query }
}