CREATE TABLE IF NOT EXISTS "app"."resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "pathname" TEXT,
    "url" TEXT,
    "contentType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);
