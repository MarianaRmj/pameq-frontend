"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { signIn } from "next-auth/react";

type Usuario = {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  sede: number | null;
};

interface AuthContextProps {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  login: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  login: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result || result.error) {
      throw new Error("Credenciales inválidas");
    }

    // Almacenar usuario si quieres persistencia local
    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    localStorage.setItem("usuario", JSON.stringify(sessionData.user));
    setUser(sessionData.user);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
