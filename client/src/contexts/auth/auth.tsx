import { createContext, useContext, useState, useEffect } from "react";
import type { LoginRep } from "../../services/auth";

const AuthContext = createContext<{
    saveStateAuth: (res: LoginRep) => void
}>({
    saveStateAuth: () => { }
});

const AuthProvider = ({ children }: { children: React.ReactNode}) => {
    const [uuid, setUuid] = useState<string>();
    const [email, setEmail] = useState<string>();
    const [accessToken, setAccessToken] = useState<string>();
    const [time, setTime] = useState<{
        issuedAt: number,
        expiresAt: number
    }>();

    const saveStateAuth = (res: LoginRep) => {
        setUuid(res.uid);
        setEmail(res.email);
        setAccessToken(res.accessToken);
        setTime(res.time);

        window.localStorage.setItem("STATE_USER", JSON.stringify(res));
    }

    useEffect(() => {
        const stateLocal = window.localStorage.getItem("STATE_USER");
        if (stateLocal) {
            const stateUser = JSON.parse(stateLocal);
            setUuid(stateUser.uid);
            setEmail(stateUser.email);
            setAccessToken(stateUser.accessToken);
            setTime(stateUser.time);
        }
    }, [])

    return (
        <AuthContext.Provider value={{saveStateAuth}}>

            {children}
        </AuthContext.Provider>
    )
}

const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("Require Auth Context");
    return ctx;
}

export { AuthProvider, useAuthContext }