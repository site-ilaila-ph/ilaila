import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Business } from "./Business";
import { UserData } from "./UserData";

@Entity("reviews", { schema: "app" })
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  businessId!: string;

  @Column({ type: "text" })
  text!: string;

  @Column({ type: "int" })
  foodQuality!: number;

  @Column({ type: "int" })
  service!: number;

  @Column({ type: "int" })
  ambiance!: number;

  @Column({ type: "int" })
  value!: number;

  @Column({ type: "int", default: 0 })
  upvotes!: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => Business, (b) => b.reviews)
  @JoinColumn({ name: "businessId" })
  business!: Business;

  @ManyToOne(() => UserData, (u) => u.reviews)
  @JoinColumn({ name: "userId" })
  user!: UserData;
}
