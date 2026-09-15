-- DropForeignKey
ALTER TABLE "app"."food_tags" DROP CONSTRAINT "food_tags_foodId_fkey";

-- DropForeignKey
ALTER TABLE "app"."uploads" DROP CONSTRAINT "uploads_userId_fkey";

-- DropForeignKey
ALTER TABLE "app"."user_data" DROP CONSTRAINT "users_auth_id_fkey";

-- AlterTable
ALTER TABLE "app"."food_images" ADD COLUMN     "position" INTEGER NOT NULL,
ALTER COLUMN "url" SET NOT NULL;

-- AlterTable
ALTER TABLE "app"."foods" ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "app"."user_data" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "authId" SET NOT NULL;
ALTER TABLE "app"."user_data" RENAME CONSTRAINT "users_pkey" TO "user_data_pkey";

-- DropTable
DROP TABLE "app"."food_tags";

-- DropTable
DROP TABLE "app"."uploads";

-- CreateTable
CREATE TABLE "app"."resources" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "app"."resources" ADD CONSTRAINT "resources_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "app"."user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."user_data" ADD CONSTRAINT "user_data_authId_fkey" FOREIGN KEY ("authId") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "app"."users_auth_id_key" RENAME TO "user_data_authId_key";
