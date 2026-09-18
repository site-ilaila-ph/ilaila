import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { acquireDatabase } from "./database";

export const container = new Container();

container.bind(TYPES.DataSource).toDynamicValue(async () => {
  return await acquireDatabase();
}).inSingletonScope();
