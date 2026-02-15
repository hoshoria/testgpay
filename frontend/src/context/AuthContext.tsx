import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthCtx {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
    token: null,
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(
        () => sessionStorage.getItem('admin_token'),
    );

    const login = useCallback((t: string) => {
        sessionStorage.setItem('admin_token', t);
        setToken(t);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem('admin_token');
        setToken(null);
    }, []);

    return (
        <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
