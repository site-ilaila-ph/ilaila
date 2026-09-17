import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("resources", { schema: "app" })
export class Resource {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  pathname!: string | null;

  @Column({ nullable: true })
  url!: string | null;

  @Column({ nullable: true })
  contentType!: string | null;

  @Column({ nullable: true })
  size!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
