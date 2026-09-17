import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Business } from "./Business";
import { Food } from "./Food";

@Entity("business_foods", { schema: "app" })
export class BusinessFood {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  businessId!: string;

  @Column({ type: "uuid" })
  foodId!: string;

  @ManyToOne(() => Business, (b) => b.foods)
  @JoinColumn({ name: "businessId" })
  business!: Business;

  @ManyToOne(() => Food, (f) => f.businesses)
  @JoinColumn({ name: "foodId" })
  food!: Food;
}
