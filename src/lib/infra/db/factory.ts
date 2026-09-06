import { db } from "@/prisma/db";

export default function factory() {
  return db;
}