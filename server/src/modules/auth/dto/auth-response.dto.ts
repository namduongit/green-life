type RegisterRep = {
    uid: string;
    email: string;
};

type LoginRep = {
    uid: string;
    email: string;
    accessToken: string;
    time: {
        issuedAt: number;
        expiresAt: number;
    };
};

export type { LoginRep, RegisterRep };
