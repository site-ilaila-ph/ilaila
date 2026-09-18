import { injectable, inject } from "inversify";
import { TYPES } from "@/lib/types";
import { ValidationError } from "@/lib/api/domain-errors";
import { AppReviewRepository } from "@/repositories/app-review-repository";

@injectable()
export class AppReviewService {
  constructor(@inject(TYPES.AppReviewRepository) private repo: AppReviewRepository) {}

  async listAppReviewsService() {
    return this.repo.listAppReviews();
  }

  async createAppReviewService(input: {
    userId?: string;
    userName?: string;
    email?: string;
    rating: number;
    text: string;
  }) {
    if (typeof input.rating !== "number" || input.rating < 1 || input.rating > 5) {
      throw new ValidationError({ code: "app-review-invalid", detail: "Rating must be between 1 and 5." });
    }
    return this.repo.createAppReview(input);
  }

  async updateAppReviewStatusService(id: string, isApproved: boolean) {
    if (!id) throw new ValidationError({ code: "app-review-id-required", detail: "An app review id is required." });
    return this.repo.updateAppReviewStatus(id, isApproved);
  }

  async deleteAppReviewService(id: string) {
    if (!id) throw new ValidationError({ code: "app-review-id-required", detail: "An app review id is required." });
    return this.repo.deleteAppReview(id);
  }

  async getAppReviewStatsService() {
    return this.repo.getAppReviewStats();
  }

  async getAllAppReviewsService() {
    return this.repo.getAllAppReviews();
  }

  async getApprovedAppReviewsService() {
    return this.repo.getApprovedAppReviews();
  }

  async getPendingAppReviewsService() {
    return this.repo.getPendingAppReviews();
  }
}
