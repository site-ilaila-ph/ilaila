import { User } from "@/generated/prisma/client";
import { OmitTimestamps } from "@/lib/types/OmitTimestamps";

export type UserWithNoSensitiveDetails = OmitTimestamps<Omit<User, 'passwordHash'>>;