CREATE TABLE IF NOT EXISTS "app"."images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT NOT NULL,
    "url" TEXT,
    "parentType" TEXT,
    "parentId" UUID,
    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "images_parentType_parentId_idx" ON "app"."images"("parentType", "parentId");
