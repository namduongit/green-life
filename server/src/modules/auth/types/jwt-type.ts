export type JwtType = {
    sub: {
        uid: string;
        email: string;
        joinTime: Date;
        isLock: boolean;
    },
    role: string;
}