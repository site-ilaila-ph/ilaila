import { ViewEntity, ViewColumn, PrimaryColumn } from "typeorm";

export enum UserRoleEnum {
  viewer = "viewer",
  admin = "admin",
}

@ViewEntity({
  name: "user_view",
  schema: "app",
})
export class User {
  @ViewColumn()
  @PrimaryColumn("uuid")
  id!: string;

  @ViewColumn()
  authId!: string;

  @ViewColumn()
  email!: string | null;

  @ViewColumn()
  role!: string | null;

  @ViewColumn()
  createdAt!: Date | null;

  @ViewColumn()
  updatedAt!: Date | null;
}
