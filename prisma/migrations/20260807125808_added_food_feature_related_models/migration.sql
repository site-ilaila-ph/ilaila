/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "preparation" TEXT NOT NULL,
    "recipe" TEXT NOT NULL,
    "culturalSignificance" TEXT NOT NULL,
    "isHeritage" BOOLEAN NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodTag" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,

    CONSTRAINT "FoodTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodImage" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "FoodImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FoodTag" ADD CONSTRAINT "FoodTag_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodImage" ADD CONSTRAINT "FoodImage_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
