import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BusinessFood } from "./BusinessFood";
import { FoodImage } from "./FoodImage";

@Entity("foods", { schema: "app" })
export class Food {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text" })
  history!: string;

  @Column({ type: "text" })
  preparation!: string;

  @Column({ type: "text" })
  recipe!: string;

  @Column({ type: "text" })
  culturalSignificance!: string;

  @Column({ type: "boolean" })
  isHeritage!: boolean;

  @Column("simple-array", { nullable: true })
  tags!: string[];

  @OneToMany(() => BusinessFood, (bf) => bf.food)
  businesses!: BusinessFood[];

  @OneToMany(() => FoodImage, (fi) => fi.food)
  images!: FoodImage[];
}
