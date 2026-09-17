import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("images", { schema: "app" })
export class Image {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  description!: string;

  @Column({ nullable: true })
  url!: string | null;

  @Column({ nullable: true })
  parentType!: string | null;

  @Column({ type: "uuid", nullable: true })
  parentId!: string | null;
}
