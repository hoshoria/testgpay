import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getProfile } from '../services/api';

interface UserProfile {
    id: number;
    username: string;
    telegramUser: string;
    profilePicture: string | null;
}

interface UserCtx {
    userToken: string | null;
    user: UserProfile | null;
    isLoggedIn: boolean;
    loginUser: (token: string, remember: boolean) => void;
    logoutUser: () => void;
    refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserCtx>({
    userToken: null,
    user: null,
    isLoggedIn: false,
    loginUser: () => { },
    logoutUser: () => { },
    refreshProfile: async () => { },
});

function getStoredToken(): string | null {
    return localStorage.getItem('user_token') || sessionStorage.getItem('user_token');
}

export function UserProvider({ children }: { children: ReactNode }) {
    const [userToken, setUserToken] = useState<string | null>(getStoredToken);
    const [user, setUser] = useState<UserProfile | null>(null);

    const loginUser = useCallback((token: string, remember: boolean) => {
        if (remember) {
            localStorage.setItem('user_token', token);
        } else {
            sessionStorage.setItem('user_token', token);
        }
        setUserToken(token);
    }, []);

    const logoutUser = useCallback(() => {
        localStorage.removeItem('user_token');
        sessionStorage.removeItem('user_token');
        setUserToken(null);
        setUser(null);
    }, []);

    const refreshProfile = useCallback(async () => {
        if (!userToken) return;
        try {
            const profile = await getProfile(userToken);
            setUser(profile);
        } catch {
            logoutUser();
        }
    }, [userToken, logoutUser]);

    useEffect(() => {
        if (userToken) refreshProfile();
    }, [userToken, refreshProfile]);

    return (
        <UserContext.Provider value={{ userToken, user, isLoggedIn: !!userToken, loginUser, logoutUser, refreshProfile }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
