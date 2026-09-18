import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity("app_reviews", { schema: "app" })
export class AppReview {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", nullable: true })
  userId!: string | null;

  @Column({ type: "text", nullable: true })
  userName!: string | null;

  @Column({ type: "text", nullable: true })
  email!: string | null;

  @Column({ type: "int", default: 5 })
  rating!: number;

  @Column({ type: "text" })
  text!: string;

  @Column({ type: "boolean", default: false })
  @Index()
  isApproved!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
