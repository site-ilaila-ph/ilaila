import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "user_view",
  schema: "app",
})
export class User {
  @ViewColumn()
  authId!: string;

  @ViewColumn()
  email!: string | null;

  @ViewColumn()
  id!: string | null;

  @ViewColumn()
  role!: string | null;

  @ViewColumn()
  createdAt!: Date | null;

  @ViewColumn()
  updatedAt!: Date | null;
}
