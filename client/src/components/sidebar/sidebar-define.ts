export type AdminActivity = {
    title: string,
    items?: {
        icon?: string,
        des: string,
        url?: string,
        children?: {
            isActive: boolean,
            items: {
                icon?: string,
                des: string,
                url: string
            }[]
        }
    }[]
}