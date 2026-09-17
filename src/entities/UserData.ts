import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { AppReview } from "./AppReview";
import { BusinessBookmark } from "./BusinessBookmark";
import { Business } from "./Business";
import { Review } from "./Review";

export enum UserRoleEnum {
  viewer = "viewer",
  admin = "admin",
}

@Entity("user_data", { schema: "app" })
export class UserData {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", unique: true })
  authId!: string;

  @Column({ type: "enum", enum: UserRoleEnum, default: UserRoleEnum.viewer })
  role!: UserRoleEnum;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => AppReview, (ar) => ar.userId)
  appReviews!: AppReview[];

  @OneToMany(() => BusinessBookmark, (bb) => bb.user)
  bookmarks!: BusinessBookmark[];

  @OneToMany(() => Business, (b) => b.createdById)
  businessesPosted!: Business[];

  @OneToMany(() => Review, (r) => r.user)
  reviews!: Review[];
}
