ALTER TABLE app.users
ALTER COLUMN "updatedAt" SET DEFAULT now();

ALTER TABLE app.businesses
ALTER COLUMN "updatedAt" SET DEFAULT now();

ALTER TABLE app.reviews
ALTER COLUMN "updatedAt" SET DEFAULT now();

ALTER TABLE app.app_reviews
ALTER COLUMN "updatedAt" SET DEFAULT now();