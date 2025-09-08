import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../helpers/Axios";

type User = { id: string; email: string; role: { name: string } } | null;
const AuthContext = createContext<{
  user: User;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/auth/session")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
