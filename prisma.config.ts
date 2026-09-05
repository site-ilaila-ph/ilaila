import { definePrismaConfig } from "prisma/config";

export default definePrismaConfig({
  orm: {
    schema: "./prisma/schema.prisma",
    datasource: {
      url: process.env.DIRECT_URL ?? "",
    },
    migrations: {
      path: "prisma/migrations",
      seed: "tsx prisma/seed.mts",
    },
  },
});
