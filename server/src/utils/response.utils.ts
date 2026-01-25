/** 
 * This type define how to http request will response into client
 * - statusCode: 200, 400, 401, ... statusCode will have the value 
 * corresponding to the returned HTTP in header
 * - message: has value Bad Request, Request Sucess, ... 
 * - data: any - value can be an object or any type - this is important data 
 * for the client to use to render images, table, ...
 * - error: "Duplicate", "No Resource", ... (Client can be use this to render
 * toast)
 */

type RestResponse<T> = {
    statusCode: number,
    message: string, 
    data: any,
    error: any
}

/** used in auth controller */
export const isAuth = <T>(data: T) => {
    return {
        statusCode: 200,
        message: "Request Success",
        data: data,
        error: null
    } as RestResponse<T>
}


/**  */
export const isGet = <T>(data: T)=> {
    return {
        statusCode: 200,
        message: "Request Success",
        data: data,
        error: null
    } as RestResponse<T>
}

export const isCreate = <T>(data: T)=> {
    return {
        statusCode: 201,
        message: "Request Success",
        data: data,
        error: null
    } as RestResponse<T>
}

export const isPut = <T>(data: T)=> {
    return {
        statusCode: 200,
        message: "Request Success",
        data: data,
        error: null
    } as RestResponse<T>
}

export const isDelete = <T>(data: T)=> {
    return {
        statusCode: 200,
        message: "Request Success",
        data: data,
        error: null
    } as RestResponse<T>
}


export type { RestResponse }