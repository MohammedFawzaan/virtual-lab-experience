import axios from 'axios';
import { createContext, useEffect, useState } from 'react'

const UserDataContext = createContext();

const UserContext = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/check`, { withCredentials: true });
        setUser({
          user: response.data.user,
          authenticated: response.data.authenticated
        });
      } catch (error) {
        if(error.response?.status === 401) {
          setUser({ authenticated: false });
        } else {
          console.log("Not Logged In", error);
        }
      }
    }
    checkAuth();
  }, []);

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
        {children}
    </UserDataContext.Provider>
  )
}

export { UserContext, UserDataContext }