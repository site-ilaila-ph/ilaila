import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Business } from "./Business";
import { UserData } from "./UserData";

@Entity("bookmarks", { schema: "app" })
export class BusinessBookmark {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  businessId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Business, (b) => b.bookmarks)
  @JoinColumn({ name: "businessId" })
  business!: Business;

  @ManyToOne(() => UserData, (u) => u.bookmarks)
  @JoinColumn({ name: "userId" })
  user!: UserData;
}
