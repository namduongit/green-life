import { createContext, useContext, useState, useEffect } from "react";
import type { LoginRep } from "../../services/auth";

type AuthContextValue = {
    saveStateAuth: (res: LoginRep) => void;
    clearStateAuth: () => void;
    state: LoginRep | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
    saveStateAuth: () => { },
    clearStateAuth: () => { },
    state: null,
    loading: true,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<LoginRep | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const saveStateAuth = (res: LoginRep) => {
        setState(res);
        window.localStorage.setItem("STATE_USER", JSON.stringify(res));
    }

    const clearStateAuth = () => {
        setState(null);
        window.localStorage.removeItem("STATE_USER");
    };

    useEffect(() => {
        const stateLocal = window.localStorage.getItem("STATE_USER");
        if (stateLocal) {
            try {
                const stateUser: LoginRep = JSON.parse(stateLocal);
                setState(stateUser);
                setLoading(false);
            } catch {
                window.localStorage.removeItem("STATE_USER");
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [])

    return (
        <AuthContext.Provider value={{ saveStateAuth, clearStateAuth, state, loading }}>

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