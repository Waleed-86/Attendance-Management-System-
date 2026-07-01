import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("ams_user");
    const token = localStorage.getItem("ams_token");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Backend se fresh user data confirm karo
      authApi
        .me()
        .then((res) => {
          setUser(res.data.data);
          localStorage.setItem("ams_user", JSON.stringify(res.data.data));
        })
        .catch(() => {
          localStorage.removeItem("ams_token");
          localStorage.removeItem("ams_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("ams_token", token);
    localStorage.setItem("ams_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore - hum local state to clear kar hi rahe hain
    }
    localStorage.removeItem("ams_token");
    localStorage.removeItem("ams_user");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}