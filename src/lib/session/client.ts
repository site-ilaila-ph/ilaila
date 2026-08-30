import { createContext, useContext } from "react";

import { User } from "@/generated/prisma/client";

export type ClientSessionUser = Omit<User, 'createdAt' | 'updatedAt' | 'passwordHash'>;

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
