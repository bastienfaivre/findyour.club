-- Add optional logo fields to applications table
ALTER TABLE "applications" ADD COLUMN "logo_url" TEXT;
ALTER TABLE "applications" ADD COLUMN "logo_alt" TEXT;
