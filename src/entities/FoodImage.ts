import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Food } from "./Food";

@Entity("food_images", { schema: "app" })
export class FoodImage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "int" })
  position!: number;

  @Column({ type: "uuid" })
  foodId!: string;

  @Column()
  description!: string;

  @Column()
  url!: string;

  @ManyToOne(() => Food, (f) => f.images)
  @JoinColumn({ name: "foodId" })
  food!: Food;
}
