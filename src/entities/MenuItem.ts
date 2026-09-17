import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Business } from "./Business";

@Entity("menu_items", { schema: "app" })
export class MenuItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  businessId!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string | null;

  @Column({ type: "decimal" })
  price!: number;

  @Column({ type: "boolean", default: true })
  isAvailable!: boolean;

  @ManyToOne(() => Business, (b) => b.menuItems)
  @JoinColumn({ name: "businessId" })
  business!: Business;
}
