-- CreateTable
CREATE TABLE "app"."uploads" (
    "id" UUID NOT NULL,
    "pathname" TEXT NOT NULL,
    "uploadName" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "uploads_userId_idx" ON "app"."uploads"("userId");

-- CreateIndex
CREATE INDEX "uploads_status_idx" ON "app"."uploads"("status");

-- AddForeignKey
ALTER TABLE "app"."uploads" ADD CONSTRAINT "uploads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex for UserData @@index([authId]).
-- The initial migration only created the UNIQUE index "users_auth_id_key" (covers @@unique([authId])),
-- but the current schema also declares @@index([authId]).
CREATE INDEX "user_data_authId_idx" ON "app"."user_data"("auth_id");

-- AlterTable: make app.user_data.auth_id required to match schema (authId String @db.Uuid, no "?")
-- NOTE: this will fail if any existing rows have NULL "auth_id". Clean or backfill those rows first.
-- The existing UNIQUE index "users_auth_id_key" already satisfies @@unique([authId]), so no new index is needed.
ALTER TABLE "app"."user_data" ALTER COLUMN "auth_id" SET NOT NULL;
