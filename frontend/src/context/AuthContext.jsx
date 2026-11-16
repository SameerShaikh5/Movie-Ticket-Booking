import React, { createContext, useContext, useState, useEffect } from 'react';
import { authCheck } from '../apis/user.apis.js';

const AuthContext = createContext(null);



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const data = await authCheck()
        if (data.success && data.data) {
          setUser(data.data)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyUserSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isCheckingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);