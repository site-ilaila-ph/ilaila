import { ValidationError } from "@/lib/api/domain-errors";
import {
  listAppReviews,
  createAppReview,
  updateAppReviewStatus,
  deleteAppReview,
  getAppReviewStats,
  getAllAppReviews,
  getApprovedAppReviews,
  getPendingAppReviews,
} from "@/repositories/app-review-repository";

export async function listAppReviewsService() {
  return listAppReviews();
}

export async function createAppReviewService(input: {
  userId?: string;
  userName?: string;
  email?: string;
  rating: number;
  text: string;
}) {
  if (typeof input.rating !== "number" || input.rating < 1 || input.rating > 5) {
    throw new ValidationError({ code: "app-review-invalid", detail: "Rating must be between 1 and 5." });
  }
  return createAppReview(input);
}

export async function updateAppReviewStatusService(id: string, isApproved: boolean) {
  if (!id) throw new ValidationError({ code: "app-review-id-required", detail: "An app review id is required." });
  return updateAppReviewStatus(id, isApproved);
}

export async function deleteAppReviewService(id: string) {
  if (!id) throw new ValidationError({ code: "app-review-id-required", detail: "An app review id is required." });
  return deleteAppReview(id);
}

export async function getAppReviewStatsService() {
  return getAppReviewStats();
}

export async function getAllAppReviewsService() {
  return getAllAppReviews();
}

export async function getApprovedAppReviewsService() {
  return getApprovedAppReviews();
}

export async function getPendingAppReviewsService() {
  return getPendingAppReviews();
}
