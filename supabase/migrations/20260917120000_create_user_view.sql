CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE VIEW app.user_view AS
SELECT
  au.id AS "authId",
  au.email AS "email",
  ud.id AS "id",
  ud.role::text AS "role",
  ud."createdAt" AS "createdAt",
  ud."updatedAt" AS "updatedAt"
FROM auth.users au
LEFT JOIN app.user_data ud ON ud."authId" = au.id;

CREATE OR REPLACE FUNCTION app.user_view_update_fn()
RETURNS trigger AS $$
BEGIN
  UPDATE app.user_data
  SET role = NEW.role::app.user_role,
      "updatedAt" = now()
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app.user_view_delete_fn()
RETURNS trigger AS $$
BEGIN
  DELETE FROM app.user_data WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_view_update_trg ON app.user_view;
CREATE TRIGGER user_view_update_trg
INSTEAD OF UPDATE ON app.user_view
FOR EACH ROW EXECUTE FUNCTION app.user_view_update_fn();

DROP TRIGGER IF EXISTS user_view_delete_trg ON app.user_view;
CREATE TRIGGER user_view_delete_trg
INSTEAD OF DELETE ON app.user_view
FOR EACH ROW EXECUTE FUNCTION app.user_view_delete_fn();
