import axios from 'axios';
import { createContext, useEffect, useState, ReactNode } from 'react';

// Define the user type
interface User {
    firstname?: string;
    lastname?: string;
    role?: string;
    email?: string;
    // Add other user properties as needed
}

// Define the context value type
interface UserContextType {
    user: {
        user?: User;
        authenticated: boolean;
    } | null;
    setUser: React.Dispatch<React.SetStateAction<{
        user?: User;
        authenticated: boolean;
    } | null>>;
}

// Create context with proper typing
const UserDataContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProps {
    children: ReactNode;
}

const UserContext = ({ children }: UserContextProps) => {
    const [user, setUser] = useState<{
        user?: User;
        authenticated: boolean;
    } | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/check`, { withCredentials: true });
                setUser({
                    user: response.data.user,
                    authenticated: response.data.authenticated
                });
            } catch (error: any) {
                if (error.response?.status === 401) {
                    setUser({ authenticated: false });
                } else {
                    console.log("Not Logged In", error);
                }
            }
        };
        checkAuth();
    }, []);

    return (
        <UserDataContext.Provider value={{ user, setUser }}>
            {children}
        </UserDataContext.Provider>
    );
};

export { UserContext, UserDataContext };
