import "reflect-metadata";
import { DataSource } from "typeorm";
import * as Entities from "@/entities";
import { singleton } from "./singleton";

export async function acquireDatabase(): Promise<DataSource> {
    const database = singleton("database", () => {
        const entityValues = Object.values(Entities);
        const entityClasses = entityValues.filter((e) => typeof e === "function" && "prototype" in e);
        const database = new DataSource({
            type: "postgres",
            url: process.env.DATABASE_URL,
            entities: entityClasses,
            poolSize: 4,
        });

        return database.initialize();
    });

    return await database;
}
