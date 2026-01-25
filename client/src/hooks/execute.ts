import { useState } from "react"

type QueryResp<T> = [null, T] | [Error, null];


/**
 * hello for (luky)
 */
export const useExecute = <T> () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error>();
    const [data, setData] = useState<T | null>(null)

    const query = async (
        promiseFunc: Promise<T>,
    ): Promise<QueryResp<T>> => {
        try {
            setLoading(true);
            console.log("Thực hiện truy vấn lấy dữ liệu")
            const result = await promiseFunc;
            console.log(result)

            setData(result);
            setLoading(false)

            return [
                null, result
            ];


        } catch (error: any) {
            setError(error) 
            setLoading(true)
            return [
                error, null
            ]           
        }
    }

    return { loading, query, data, error }
}