export type RestResponse<T> = {
    statusCode: number;
    message: string,
    data: T,
    error: string | string[] | null
}