export type LoginRep = {
    uid: string,
    email: string,
    role: string,
    accessToken: string,
    time: {
        issuedAt: number,
        expiresAt: number
    }
}

export type RegisterRep = {
    uid: string,
    email: string
}