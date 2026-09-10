-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateTable
CREATE TYPE "app"."user_role" AS ENUM ('viewer', 'admin');
CREATE TABLE "app"."user_data" (
    "id" UUID NOT NULL,
    "auth_id" UUID,
    "role" "app"."user_role" NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "app"."user_data"("auth_id");

-- AddForeignKey
ALTER TABLE "app"."user_data" ADD CONSTRAINT "users_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "app"."foods" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "preparation" TEXT NOT NULL,
    "recipe" TEXT NOT NULL,
    "culturalSignificance" TEXT NOT NULL,
    "isHeritage" BOOLEAN NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."food_tags" (
    "id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "foodId" UUID NOT NULL,

    CONSTRAINT "food_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."food_images" (
    "id" UUID NOT NULL,
    "foodId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "food_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."businesses" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "history" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "hours" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."business_images" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "business_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."business_tags" (
    "id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "businessId" UUID NOT NULL,

    CONSTRAINT "business_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."menu_items" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."business_foods" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "foodId" UUID NOT NULL,

    CONSTRAINT "business_foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."reviews" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "foodQuality" INTEGER NOT NULL,
    "service" INTEGER NOT NULL,
    "ambiance" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."bookmarks" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."app_reviews" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "userName" TEXT,
    "email" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "app_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_foods_businessId_foodId_key" ON "app"."business_foods"("businessId", "foodId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_userId_businessId_key" ON "app"."reviews"("userId", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_businessId_key" ON "app"."bookmarks"("userId", "businessId");

-- CreateIndex
CREATE INDEX "app_reviews_isApproved_idx" ON "app"."app_reviews"("isApproved");

-- CreateIndex
CREATE INDEX "app_reviews_createdAt_idx" ON "app"."app_reviews"("createdAt");

-- AddForeignKey
ALTER TABLE "app"."food_tags" ADD CONSTRAINT "food_tags_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "app"."foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."food_images" ADD CONSTRAINT "food_images_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "app"."foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."businesses" ADD CONSTRAINT "businesses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "app"."user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."business_images" ADD CONSTRAINT "business_images_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "app"."businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."business_tags" ADD CONSTRAINT "business_tags_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "app"."businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."menu_items" ADD CONSTRAINT "menu_items_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "app"."businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."business_foods" ADD CONSTRAINT "business_foods_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "app"."businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."business_foods" ADD CONSTRAINT "business_foods_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "app"."foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."reviews" ADD CONSTRAINT "reviews_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "app"."businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."bookmarks" ADD CONSTRAINT "bookmarks_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "app"."businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."user_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."app_reviews" ADD CONSTRAINT "app_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."user_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;
