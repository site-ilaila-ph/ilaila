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
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL')
  },
});