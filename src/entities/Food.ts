import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BusinessFood } from "./BusinessFood";
import { Image } from "./Image";

@Entity("foods", { schema: "app" })
export class Food {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
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

  @Column({ type: "text", array: true, nullable: true })
  tags!: string[];

  @OneToMany(() => BusinessFood, (bf) => bf.food)
  businesses!: BusinessFood[];

  @OneToMany(() => Image, (img) => img.parentId, { createForeignKeyConstraints: false })
  images!: Image[];
}
