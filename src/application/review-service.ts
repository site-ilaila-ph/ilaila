import { injectable, inject } from "inversify";
import { TYPES } from "@/lib/types";
import { ValidationError } from "@/lib/api/domain-errors";
import { ReviewRepository } from "@/repositories/review-repository";

@injectable()
export class ReviewService {
  constructor(@inject(TYPES.ReviewRepository) private repo: ReviewRepository) {}

  async listReviewsService(businessId?: string) {
    if (businessId) {
      return this.repo.listReviewsForBusiness(businessId);
    }
    return this.repo.listAllReviews();
  }

  async createReviewService(input: {
    businessId: string;
    userId: string;
    text: string;
    foodQuality: number;
    service: number;
    ambiance: number;
    value: number;
  }) {
    if (!input.businessId) throw new ValidationError({ code: "review-business-required", detail: "A business id is required." });
    if (!input.userId) throw new ValidationError({ code: "review-user-required", detail: "A user id is required." });
    return this.repo.createReview(input);
  }

  async updateReviewService(id: string, input: Partial<{ text: string; foodQuality: number; service: number; ambiance: number; value: number; upvote?: boolean }>) {
    if (!id) throw new ValidationError({ code: "review-id-required", detail: "A review id is required." });
    return this.repo.updateReview(id, input);
  }

  async deleteReviewService(id: string) {
    if (!id) throw new ValidationError({ code: "review-id-required", detail: "A review id is required." });
    return this.repo.deleteReviewById(id);
  }
}
