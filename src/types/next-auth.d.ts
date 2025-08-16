// types/next-auth.d.ts

import {  DefaultUser } from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      email: string;
      nombre: string;
      rol: string;
      sede: number | null;
    };
    backendToken?: string;
  }

  interface User extends DefaultUser {
    id: number;
    email: string;
    nombre: string;
    rol: string;
    sede: number | null;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    email: string;
    nombre: string;
    rol: string;
    sede: number | null;
    token: string;
  }
}
