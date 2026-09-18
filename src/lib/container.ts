import "reflect-metadata";
import { Container } from "inversify";

import { acquireDatabase } from "./database";
import { AppReviewService } from "@/application/app-review-service";
import { AuthService } from "@/application/auth-service";
import { BusinessService } from "@/application/business-service";
import { FoodService } from "@/application/food-service";
import { ImageService } from "@/application/image-service";
import { ManagementService } from "@/application/management-service";
import { ResourceService } from "@/application/resource-service";
import { ReviewService } from "@/application/review-service";
import { AppReviewRepository } from "@/repositories/app-review-repository";
import { BusinessRepository } from "@/repositories/business-repository";
import { FoodRepository } from "@/repositories/food-repository";
import { ImageRepository } from "@/repositories/image-repository";
import { ManagementRepository } from "@/repositories/management-repository";
import { ResourceRepository } from "@/repositories/resource-repository";
import { ReviewRepository } from "@/repositories/review-repository";
import { UserRepository } from "@/repositories/user-repository";
import { MemoryCacheService } from "@/infrastructure/memory-cache-service";
import { CacheService } from "@/infrastructure/cache-service";
import { StorageService } from "@/infrastructure/storage-service";

export const container = new Container();

container.bind("DataSource").toDynamicValue(async () => {
  return await acquireDatabase();
}).inSingletonScope();

// Repositories
container.bind("AppReviewRepository").to(AppReviewRepository);
container.bind("BusinessRepository").to(BusinessRepository);
container.bind("FoodRepository").to(FoodRepository);
container.bind("ImageRepository").to(ImageRepository);
container.bind("ManagementRepository").to(ManagementRepository);
container.bind("ResourceRepository").to(ResourceRepository);
container.bind("ReviewRepository").to(ReviewRepository);
container.bind("UserRepository").to(UserRepository);

// Services
container.bind("AppReviewService").to(AppReviewService);
container.bind("AuthService").to(AuthService);
container.bind("BusinessService").to(BusinessService);
container.bind("FoodService").to(FoodService);
container.bind("ImageService").to(ImageService);
container.bind("ManagementService").to(ManagementService);
container.bind("ResourceService").to(ResourceService);
container.bind("ReviewService").to(ReviewService);

// Cache
container.bind("MemoryCache").to(MemoryCacheService);
container.bind("CacheManager").to(CacheService);

// Storage
container.bind("StorageManager").to(StorageService);
