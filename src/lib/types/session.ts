import { User } from "@/generated/prisma/client";

export type ClientSessionUser = Omit<User, 'createdAt' | 'updatedAt' | 'passwordHash'>;

export type ServerReadonlySessionApi = {
    id(): Promise<string>;
    user(): Promise<User>;
}

export type ClientReadonlySession = {
    id: string;
    user: ClientSessionUser;
}

// models `session()` in the server.
export type ServerSessionFn = () => ServerReadonlySessionApi;

// models `useSession()` in the client.
export type ClientUseSessionFn = () => ClientReadonlySession;