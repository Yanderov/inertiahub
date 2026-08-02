-- ============================================================
-- InertiaHub — Supabase RLS hardening (static, idempotent)
--
-- Enables row-level security on every public table and grants a
-- full-access policy to the "postgres" role so Prisma keeps
-- working (even with FORCE ROW LEVEL SECURITY, superusers bypass,
-- so this is belt-and-suspenders). The "anon" / "service_role"
-- roles receive NO policies -> denied by default.
--
-- Safe to re-run.
-- ============================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='User' AND policyname='prisma_full_access_User') THEN
    CREATE POLICY prisma_full_access_User ON "User" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='Session' AND policyname='prisma_full_access_Session') THEN
    CREATE POLICY prisma_full_access_Session ON "Session" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Role" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='Role' AND policyname='prisma_full_access_Role') THEN
    CREATE POLICY prisma_full_access_Role ON "Role" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "Permission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Permission" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='Permission' AND policyname='prisma_full_access_Permission') THEN
    CREATE POLICY prisma_full_access_Permission ON "Permission" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "RolePermission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RolePermission" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='RolePermission' AND policyname='prisma_full_access_RolePermission') THEN
    CREATE POLICY prisma_full_access_RolePermission ON "RolePermission" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "Page" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Page" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='Page' AND policyname='prisma_full_access_Page') THEN
    CREATE POLICY prisma_full_access_Page ON "Page" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "News" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "News" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='News' AND policyname='prisma_full_access_News') THEN
    CREATE POLICY prisma_full_access_News ON "News" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "BlogPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BlogPost" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='BlogPost' AND policyname='prisma_full_access_BlogPost') THEN
    CREATE POLICY prisma_full_access_BlogPost ON "BlogPost" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "Changelog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Changelog" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='Changelog' AND policyname='prisma_full_access_Changelog') THEN
    CREATE POLICY prisma_full_access_Changelog ON "Changelog" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Announcement" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='Announcement' AND policyname='prisma_full_access_Announcement') THEN
    CREATE POLICY prisma_full_access_Announcement ON "Announcement" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "Statistic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Statistic" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='Statistic' AND policyname='prisma_full_access_Statistic') THEN
    CREATE POLICY prisma_full_access_Statistic ON "Statistic" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "PageAnalytic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PageAnalytic" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='PageAnalytic' AND policyname='prisma_full_access_PageAnalytic') THEN
    CREATE POLICY prisma_full_access_PageAnalytic ON "PageAnalytic" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "ContactMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactMessage" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ContactMessage' AND policyname='prisma_full_access_ContactMessage') THEN
    CREATE POLICY prisma_full_access_ContactMessage ON "ContactMessage" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NewsletterSubscriber" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='NewsletterSubscriber' AND policyname='prisma_full_access_NewsletterSubscriber') THEN
    CREATE POLICY prisma_full_access_NewsletterSubscriber ON "NewsletterSubscriber" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='AuditLog' AND policyname='prisma_full_access_AuditLog') THEN
    CREATE POLICY prisma_full_access_AuditLog ON "AuditLog" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "SiteSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteSetting" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='SiteSetting' AND policyname='prisma_full_access_SiteSetting') THEN
    CREATE POLICY prisma_full_access_SiteSetting ON "SiteSetting" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ApiKey' AND policyname='prisma_full_access_ApiKey') THEN
    CREATE POLICY prisma_full_access_ApiKey ON "ApiKey" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE "MediaItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MediaItem" FORCE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='MediaItem' AND policyname='prisma_full_access_MediaItem') THEN
    CREATE POLICY prisma_full_access_MediaItem ON "MediaItem" FOR ALL TO postgres USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Sanity check
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity
ORDER BY tablename;
