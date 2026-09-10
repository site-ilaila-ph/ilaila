CREATE TYPE "app"."user_role" AS ENUM ('viewer', 'admin');
ALTER TABLE "app"."users" ALTER COLUMN "role" TYPE "app"."user_role" USING ("role"::text::"app"."user_role");
ALTER TABLE "app"."users" ALTER COLUMN "role" SET DEFAULT 'viewer';
