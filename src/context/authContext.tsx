import React, { createContext, useContext, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { StatusAPI, User } from "../api/status.service";

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const data = await StatusAPI.signin(email, password);
    if (!data?.token) throw new Error("No token in response");

    setUser({
      _id: data._id,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      role: data.role,
      type: data.type,
      confirmed: data.confirmed,
      image: data.image,
    });
    setToken(data.token);
    await SecureStore.setItemAsync("token", data.token);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync("token");
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
