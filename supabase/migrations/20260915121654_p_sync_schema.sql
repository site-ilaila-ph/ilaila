-- CreateTable
CREATE TABLE "app"."review_images" (
    "id" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "review_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "app"."review_images" ADD CONSTRAINT "review_images_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "app"."reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
