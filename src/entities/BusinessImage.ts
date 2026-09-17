import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Business } from "./Business";

@Entity("business_images", { schema: "app" })
export class BusinessImage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  businessId!: string;

  @Column()
  description!: string;

  @Column({ nullable: true })
  url!: string | null;

  @ManyToOne(() => Business, (b) => b.images)
  @JoinColumn({ name: "businessId" })
  business!: Business;
}
