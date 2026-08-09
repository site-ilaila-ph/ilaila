"use client";

import { createContext, useContext } from "react";
import { ClientReadonlySession } from "../types/session";

const SessionContext = createContext<ClientReadonlySession | null>(null);

const useSession = () => {
  const session = useContext(SessionContext);
  return session;
}

export { SessionContext, useSession };