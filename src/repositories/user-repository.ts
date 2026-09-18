import { injectable } from "inversify";
import { DataSource } from "typeorm";
import { UserData, UserRoleEnum } from "@/entities";

@injectable()
export class UserRepository {
  public constructor(private readonly db: DataSource) {}

  private get repo() {
    return this.db.getRepository(UserData);
  }

  async listUsers() {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  async updateUserRole(input: { userId: string; role: "admin" | "viewer" }) {
    return this.repo.update({ id: input.userId }, { role: input.role as UserRoleEnum });
  }

  async deleteUserById(id: string) {
    await this.repo.delete({ id });
    return { success: true };
  }

  async findFirstUserId(): Promise<string | null> {
    const row = await this.repo.findOne({ select: { id: true } });
    return row?.id ?? null;
  }

  async findUserIdByAuthId(authId: string): Promise<string | null> {
    const row = await this.repo.findOne({ select: { id: true }, where: { authId } });
    return row?.id ?? null;
  }
}
