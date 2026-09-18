import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("images", { schema: "app" })
export class Image {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text", nullable: true })
  url!: string | null;

  @Column({ type: "text", nullable: true })
  parentType!: string | null;

  @Column({ type: "uuid", nullable: true })
  parentId!: string | null;
}
