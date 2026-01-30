-- Exactly one owner per organization
CREATE UNIQUE INDEX "member_one_owner_per_org"
ON "member" ("organizationId")
WHERE "role" = 'owner'::"OrgRole";

CREATE OR REPLACE FUNCTION prevent_owner_role_changes()
RETURNS trigger AS $$
BEGIN
  -- owner cannot be demoted
  IF OLD."role" = 'owner'::"OrgRole" AND NEW."role" <> OLD."role" THEN
    RAISE EXCEPTION 'Owner role is immutable';
  END IF;

  -- no one can be promoted to owner via update
  IF OLD."role" <> 'owner'::"OrgRole" AND NEW."role" = 'owner'::"OrgRole" THEN
    RAISE EXCEPTION 'Cannot promote to owner';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "member_prevent_owner_role_changes" ON "member";

CREATE TRIGGER "member_prevent_owner_role_changes"
BEFORE UPDATE OF "role" ON "member"
FOR EACH ROW
EXECUTE FUNCTION prevent_owner_role_changes();

CREATE OR REPLACE FUNCTION prevent_owner_delete()
RETURNS trigger AS $$
BEGIN
  IF OLD."role" = 'owner'::"OrgRole" THEN
    RAISE EXCEPTION 'Cannot delete owner membership';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "member_prevent_owner_delete" ON "member";

CREATE TRIGGER "member_prevent_owner_delete"
BEFORE DELETE ON "member"
FOR EACH ROW
EXECUTE FUNCTION prevent_owner_delete();

CREATE OR REPLACE FUNCTION ensure_owner_is_superadmin()
RETURNS trigger AS $$
BEGIN
  IF NEW."role" = 'owner'::"OrgRole" THEN
    IF NOT EXISTS (
      SELECT 1 FROM "super_admin" sa
      WHERE sa."userId" = NEW."userId"
    ) THEN
      RAISE EXCEPTION 'Owner must be a superadmin';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "member_owner_must_be_superadmin" ON "member";

CREATE TRIGGER "member_owner_must_be_superadmin"
BEFORE INSERT OR UPDATE OF "role", "userId" ON "member"
FOR EACH ROW
EXECUTE FUNCTION ensure_owner_is_superadmin();

CREATE OR REPLACE FUNCTION prevent_owner_disable()
RETURNS trigger AS $$
BEGIN
  IF OLD."role" = 'owner'::"OrgRole" THEN
    IF NEW."status" <> OLD."status"
      OR NEW."disabledAt" IS DISTINCT FROM OLD."disabledAt"
      OR NEW."disabledReason" IS DISTINCT FROM OLD."disabledReason" THEN
      RAISE EXCEPTION 'Owner membership cannot be disabled';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "member_prevent_owner_disable" ON "member";

CREATE TRIGGER "member_prevent_owner_disable"
BEFORE UPDATE OF "status", "disabledAt", "disabledReason" ON "member"
FOR EACH ROW
EXECUTE FUNCTION prevent_owner_disable();
