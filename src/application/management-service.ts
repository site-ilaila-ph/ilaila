import { injectable, inject } from "inversify";
import { ValidationError, UnauthorizedError } from "@/lib/api/domain-errors";
import { ReviewRepository } from "@/repositories/review-repository";
import { AppReviewRepository } from "@/repositories/app-review-repository";
import { UserRepository } from "@/repositories/user-repository";
import { ManagementRepository } from "@/repositories/management-repository";

@injectable()
export class ManagementService {
  constructor(
    @inject("ReviewRepository") private reviewRepo: ReviewRepository,
    @inject("AppReviewRepository") private appReviewRepo: AppReviewRepository,
    @inject("UserRepository") private userRepo: UserRepository,
    @inject("ManagementRepository") private mgmtRepo: ManagementRepository,
  ) {}

  async listAllReviewsService() {
    return this.reviewRepo.listAllReviews();
  }

  async deleteReviewService(id: string) {
    if (!id) throw new ValidationError({ code: "review-id-required", detail: "A review id is required." });
    return this.reviewRepo.deleteReviewById(id);
  }

  async listAppReviewsService() {
    return this.appReviewRepo.listAppReviews();
  }

  async createAppReviewService(input: { userId: string; email: string; rating: number; text: string }) {
    if (!input.userId || !input.email || typeof input.rating !== "number" || !input.text) {
      throw new ValidationError({ code: "app-review-invalid", detail: "The app review could not be validated." });
    }
    if (input.rating < 1 || input.rating > 5) {
      throw new ValidationError({ code: "app-review-invalid", detail: "Rating must be between 1 and 5." });
    }
    return this.appReviewRepo.createAppReview(input);
  }

  async listUsersService() {
    const rows = await this.userRepo.listUsers();
    return rows.map((row) => ({ ...row, isAdmin: row.role === "admin" }));
  }

  async updateUserRoleService(input: { userId: string; isAdmin: boolean }) {
    if (!input.userId) throw new ValidationError({ code: "user-id-required", detail: "A user id is required." });
    return this.userRepo.updateUserRole({ userId: input.userId, role: input.isAdmin ? "admin" : "viewer" });
  }

  async deleteUserService(id: string) {
    if (!id) throw new ValidationError({ code: "user-id-required", detail: "A user id is required." });
    return this.userRepo.deleteUserById(id);
  }

  async getDashboardCountsService() {
    return this.mgmtRepo.getDashboardCounts();
  }

  requireAuthId(authId: string | null | undefined): string {
    if (!authId) {
      throw new UnauthorizedError({ code: "review-auth-required", detail: "You need to sign in before posting a review." });
    }
    return authId;
  }
}
