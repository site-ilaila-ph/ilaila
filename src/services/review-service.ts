import { ValidationError } from "@/lib/api/domain-errors";
import { listAllReviews, deleteReviewById, listReviewsForBusiness, createReview, updateReview } from "@/repositories/review-repository";

export async function listReviewsService(businessId?: string) {
  if (businessId) {
    return listReviewsForBusiness(businessId);
  }
  return listAllReviews();
}

export async function createReviewService(input: {
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
  return createReview(input);
}

export async function updateReviewService(id: string, input: Partial<{ text: string; foodQuality: number; service: number; ambiance: number; value: number }>) {
  if (!id) throw new ValidationError({ code: "review-id-required", detail: "A review id is required." });
  return updateReview(id, input);
}

export async function deleteReviewService(id: string) {
  if (!id) throw new ValidationError({ code: "review-id-required", detail: "A review id is required." });
  return deleteReviewById(id);
}
