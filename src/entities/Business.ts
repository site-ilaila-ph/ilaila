import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { BusinessBookmark } from "./BusinessBookmark";
import { BusinessFood } from "./BusinessFood";
import { Image } from "./Image";
import { MenuItem } from "./MenuItem";
import { Review } from "./Review";

@Entity("businesses", { schema: "app" })
export class Business {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text", nullable: true })
  history!: string | null;

  @Column({ type: "boolean", default: true })
  isPublished!: boolean;

  @Column({ type: "uuid" })
  createdById!: string;

  @Column()
  address!: string;

  @Column({ type: "float" })
  latitude!: number;

  @Column({ type: "float" })
  longitude!: number;

  @Column()
  hours!: string;

  @Column("simple-array", { nullable: true })
  tags!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => BusinessBookmark, (b) => b.business)
  bookmarks!: BusinessBookmark[];

  @OneToMany(() => BusinessFood, (bf) => bf.business)
  foods!: BusinessFood[];

  @OneToMany(() => Image, (img) => img.parentId, { createForeignKeyConstraints: false })
  images!: Image[];

  @OneToMany(() => MenuItem, (m) => m.business)
  menuItems!: MenuItem[];

  @OneToMany(() => Review, (r) => r.business)
  reviews!: Review[];
}
