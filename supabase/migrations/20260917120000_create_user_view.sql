CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE VIEW app.user_view AS
SELECT
  au.id AS auth_id,
  au.email AS email,
  ud.id AS id,
  ud.auth_id AS auth_id,
  ud.role AS role,
  ud.created_at AS created_at,
  ud.updated_at AS updated_at
FROM auth.users au
LEFT JOIN app.user_data ud ON ud.auth_id = au.id;
