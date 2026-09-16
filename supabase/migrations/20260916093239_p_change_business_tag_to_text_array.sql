ALTER TABLE "app"."businesses"
ADD COLUMN "tags" TEXT[];

UPDATE "app"."businesses" AS b
SET tags = bt.tags
FROM (
    SELECT
        "businessId",
        array_agg(value) AS tags
    FROM "app"."business_tags"
    GROUP BY "businessId"
) AS bt
WHERE b.id = bt."businessId";

DROP TABLE "app"."business_tags";