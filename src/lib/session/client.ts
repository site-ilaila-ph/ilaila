"use client";

import { createContext, useContext } from "react";

export type ClientSessionUser = {
    id: string;
    email: string;
    userName: string | null;
    isAdmin: boolean;
};

export type ClientReadonlySession = {
    id: string;
    user: ClientSessionUser;
}

const SessionContext = createContext<ClientReadonlySession | null>(null);

const useSession = () => {
  const session = useContext(SessionContext);
  return session;
}

export { SessionContext, useSession };
