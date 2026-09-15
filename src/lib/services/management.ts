import { ValidationError, UnauthorizedError } from "@/lib/api/domain-errors";
import { listAllReviews, deleteReviewById } from "@/lib/repos/review";
import { listAppReviews, createAppReview } from "@/lib/repos/app-review";
import { listUsers, updateUserRole, deleteUserById } from "@/lib/repos/user";
import { getDashboardCounts } from "@/lib/repos/management";

export async function listAllReviewsService() {
  return listAllReviews();
}

export async function deleteReviewService(id: string) {
  if (!id) throw new ValidationError({ code: "review-id-required", detail: "A review id is required." });
  return deleteReviewById(id);
}

export async function listAppReviewsService() {
  return listAppReviews();
}

export async function createAppReviewService(input: { userId: string; email: string; rating: number; text: string }) {
  if (!input.userId || !input.email || typeof input.rating !== "number" || !input.text) {
    throw new ValidationError({ code: "app-review-invalid", detail: "The app review could not be validated." });
  }
  if (input.rating < 1 || input.rating > 5) {
    throw new ValidationError({ code: "app-review-invalid", detail: "Rating must be between 1 and 5." });
  }
  return createAppReview(input);
}

export async function listUsersService() {
  const rows = await listUsers();
  return rows.map((row) => ({ ...row, isAdmin: row.role === "admin" }));
}

export async function updateUserRoleService(input: { userId: string; isAdmin: boolean }) {
  if (!input.userId) throw new ValidationError({ code: "user-id-required", detail: "A user id is required." });
  return updateUserRole({ userId: input.userId, role: input.isAdmin ? "admin" : "viewer" });
}

export async function deleteUserService(id: string) {
  if (!id) throw new ValidationError({ code: "user-id-required", detail: "A user id is required." });
  return deleteUserById(id);
}

export async function getDashboardCountsService() {
  return getDashboardCounts();
}

export function requireAuthId(authId: string | null | undefined): string {
  if (!authId) {
    throw new UnauthorizedError({ code: "review-auth-required", detail: "You need to sign in before posting a review." });
  }
  return authId;
}
