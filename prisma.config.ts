import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("DIRECT_URL"),
  },

  schema: "prisma/schema.prisma",

  migrations: {
    seed: "seed/db.mts",
  },

  tables: {
    external: [
      // Supabase Auth
      "auth.aal_level",
      "auth.users",
      "auth.audit_log_entries",
      "auth.custom_oauth_providers",
      "auth.flow_state",
      "auth.identities",
      "auth.instances",
      "auth.mfa_amr_claims",
      "auth.mfa_challenges",
      "auth.mfa_factors",
      "auth.oauth_authorizations",
      "auth.oauth_client_states",
      "auth.oauth_clients",
      "auth.oauth_consents",
      "auth.one_time_tokens",
      "auth.refresh_tokens",
      "auth.saml_providers",
      "auth.saml_relay_states",
      "auth.schema_migrations",
      "auth.sessions",
      "auth.sso_domains",
      "auth.sso_providers",
      "auth.webauthn_challenges",
      "auth.webauthn_credentials",

      // Supabase Storage
      "storage.buckets",
      "storage.buckets_analytics",
      "storage.buckets_vectors",
      "storage.iceberg_namespaces",
      "storage.iceberg_tables",
      "storage.migrations",
      "storage.objects",
      "storage.s3_multipart_uploads",
      "storage.s3_multipart_uploads_parts",
      "storage.vector_indexes",
    ],
  },

  enums: {
    external: [
      "auth.aal_level",
      "auth.code_challenge_method",
      "auth.factor_status",
      "auth.factor_type",
      "auth.oauth_authorization_status",
      "auth.oauth_client_type",
      "auth.oauth_registration_type",
      "auth.oauth_response_type",
      "auth.one_time_token_type",
      "storage.buckettype",
    ],
  },

  experimental: {
    externalTables: true,
  },
});
