ALTER TABLE "app"."users" ADD COLUMN "auth_id" UUID;
CREATE UNIQUE INDEX "users_auth_id_key" ON "app"."users"("auth_id");
ALTER TABLE "app"."users" ADD CONSTRAINT "users_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
