    type AccountRep = {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: string;
        isLock: boolean;
    }

    export type { AccountRep }