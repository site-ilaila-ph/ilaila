<<<<<<< HEAD
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
=======
import 'dotenv/config'; // Loads default .env
import { config } from 'dotenv';
import path from 'path';
import { defineConfig, env } from 'prisma/config';

// load local .env if not in production.
if (process.env.NODE_ENV !== "production") {
  config({ path: path.join(import.meta.dirname, '.env.development') });
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.mts'
  }
});