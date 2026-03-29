-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLUB_ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "ClubMemberRole" AS ENUM ('OWNER', 'EDITOR');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ElementType" AS ENUM ('rich_text', 'image', 'gallery', 'calendar', 'documents', 'contact');

-- CreateEnum
CREATE TYPE "PageEventType" AS ENUM ('page_view', 'contact_form_sent', 'apply_form_sent', 'login_event', 'edit_event');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "preferred_language" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLUB_ADMIN',
    "password_hash" TEXT,
    "totp_secret" TEXT,
    "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "pending_totp_secret" TEXT,
    "magic_token" TEXT,
    "magic_token_exp" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "role" "ClubMemberRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "invited_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joined_at" TIMESTAMP(3),

    CONSTRAINT "club_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" "ClubStatus" NOT NULL DEFAULT 'ACTIVE',
    "email" TEXT NOT NULL,
    "activity_type" TEXT,
    "location_id" TEXT,
    "logo_url" TEXT,
    "logo_alt" TEXT,
    "description" TEXT,
    "schedule" TEXT,
    "how_to_join" TEXT,
    "contact_phone" TEXT,
    "contact_address" TEXT,
    "external_website_url" TEXT,
    "instagram_url" TEXT,
    "facebook_url" TEXT,
    "x_url" TEXT,
    "tiktok_url" TEXT,
    "discord_url" TEXT,
    "youtube_url" TEXT,
    "whatsapp_url" TEXT,
    "telegram_url" TEXT,
    "github_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "force_offline" BOOLEAN NOT NULL DEFAULT false,
    "accent_color" TEXT NOT NULL DEFAULT 'zinc',
    "custom_domain" TEXT,
    "storage_used_bytes" BIGINT NOT NULL DEFAULT 0,
    "storage_limit_bytes" BIGINT NOT NULL DEFAULT 5368709120,
    "template_version" TEXT NOT NULL DEFAULT '1.0.0',
    "default_language" TEXT NOT NULL DEFAULT 'fr',
    "last_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "activity_type" TEXT,
    "other_description" TEXT,
    "location_id" TEXT,
    "description" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "club_email" TEXT,
    "schedule" TEXT,
    "contact_phone" TEXT,
    "contact_address" TEXT,
    "applicant_first_name" TEXT,
    "applicant_last_name" TEXT,
    "applicant_phone" TEXT,
    "applicant_preferred_language" TEXT,
    "how_to_join" TEXT,
    "external_website_url" TEXT,
    "instagram_url" TEXT,
    "facebook_url" TEXT,
    "x_url" TEXT,
    "tiktok_url" TEXT,
    "discord_url" TEXT,
    "youtube_url" TEXT,
    "whatsapp_url" TEXT,
    "telegram_url" TEXT,
    "github_url" TEXT,
    "desired_slug" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "swiss_location_id" TEXT,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swiss_cantons" (
    "code" TEXT NOT NULL,

    CONSTRAINT "swiss_cantons_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "swiss_canton_translations" (
    "canton_code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "swiss_canton_translations_pkey" PRIMARY KEY ("canton_code","language")
);

-- CreateTable
CREATE TABLE "swiss_locations" (
    "id" TEXT NOT NULL,
    "swisstopo_id" TEXT NOT NULL,
    "canton_code" TEXT NOT NULL,

    CONSTRAINT "swiss_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swiss_location_translations" (
    "swiss_location_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "swiss_location_translations_pkey" PRIMARY KEY ("swiss_location_id","language")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_anchor" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_elements" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "type" "ElementType" NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "page_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "element_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "element_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "element_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_events" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "page_slug" TEXT NOT NULL,
    "event_type" "PageEventType" NOT NULL,
    "country" TEXT,
    "referrer" TEXT,
    "ip_hash" TEXT,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "encrypted_body" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webauthn_credentials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "device_type" TEXT,
    "backed_up" BOOLEAN NOT NULL DEFAULT false,
    "transports" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_photos" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "sender_role" "UserRole" NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_read_cursors" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_read_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_read_cursors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_replies" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "operator_id" TEXT,
    "body" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_checks" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "lighthouse_perf" DOUBLE PRECISION,
    "lighthouse_a11y" DOUBLE PRECISION,
    "lighthouse_seo" DOUBLE PRECISION,
    "uptime_pct" DOUBLE PRECISION,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migration_logs" (
    "id" TEXT NOT NULL,
    "template_version" TEXT NOT NULL,
    "migrated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clubs_affected" INTEGER NOT NULL,
    "migration_type" TEXT NOT NULL,

    CONSTRAINT "migration_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_magic_token_key" ON "users"("magic_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_hash_key" ON "invitations"("token_hash");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "club_memberships_club_id_idx" ON "club_memberships"("club_id");

-- CreateIndex
CREATE INDEX "club_memberships_user_id_idx" ON "club_memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "club_memberships_user_id_club_id_key" ON "club_memberships"("user_id", "club_id");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_custom_domain_key" ON "clubs"("custom_domain");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_country_key" ON "clubs"("slug", "country");

-- CreateIndex
CREATE INDEX "applications_status_submitted_at_idx" ON "applications"("status", "submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "locations_swiss_location_id_key" ON "locations"("swiss_location_id");

-- CreateIndex
CREATE INDEX "locations_country_idx" ON "locations"("country");

-- CreateIndex
CREATE UNIQUE INDEX "swiss_locations_swisstopo_id_key" ON "swiss_locations"("swisstopo_id");

-- CreateIndex
CREATE UNIQUE INDEX "pages_club_id_slug_key" ON "pages"("club_id", "slug");

-- CreateIndex
CREATE INDEX "page_elements_club_id_page_id_idx" ON "page_elements"("club_id", "page_id");

-- CreateIndex
CREATE INDEX "content_versions_club_id_page_id_idx" ON "content_versions"("club_id", "page_id");

-- CreateIndex
CREATE INDEX "page_events_club_id_visited_at_idx" ON "page_events"("club_id", "visited_at");

-- CreateIndex
CREATE INDEX "page_events_ip_hash_idx" ON "page_events"("ip_hash");

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credentials_credential_id_key" ON "webauthn_credentials"("credential_id");

-- CreateIndex
CREATE INDEX "club_photos_club_id_idx" ON "club_photos"("club_id");

-- CreateIndex
CREATE INDEX "support_messages_club_id_created_at_idx" ON "support_messages"("club_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_read_cursors_club_id_user_id_key" ON "conversation_read_cursors"("club_id", "user_id");

-- CreateIndex
CREATE INDEX "support_tickets_club_id_idx" ON "support_tickets"("club_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_swiss_location_id_fkey" FOREIGN KEY ("swiss_location_id") REFERENCES "swiss_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swiss_canton_translations" ADD CONSTRAINT "swiss_canton_translations_canton_code_fkey" FOREIGN KEY ("canton_code") REFERENCES "swiss_cantons"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swiss_locations" ADD CONSTRAINT "swiss_locations_canton_code_fkey" FOREIGN KEY ("canton_code") REFERENCES "swiss_cantons"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swiss_location_translations" ADD CONSTRAINT "swiss_location_translations_swiss_location_id_fkey" FOREIGN KEY ("swiss_location_id") REFERENCES "swiss_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_elements" ADD CONSTRAINT "page_elements_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_elements" ADD CONSTRAINT "page_elements_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_element_id_fkey" FOREIGN KEY ("element_id") REFERENCES "page_elements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_element_id_fkey" FOREIGN KEY ("element_id") REFERENCES "page_elements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_element_id_fkey" FOREIGN KEY ("element_id") REFERENCES "page_elements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_events" ADD CONSTRAINT "page_events_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_photos" ADD CONSTRAINT "club_photos_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_read_cursors" ADD CONSTRAINT "conversation_read_cursors_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_read_cursors" ADD CONSTRAINT "conversation_read_cursors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_checks" ADD CONSTRAINT "health_checks_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed Swiss Cantons (reference data required for application form)
INSERT INTO "swiss_cantons" ("code") VALUES
('AG'),('AI'),('AR'),('BE'),('BL'),('BS'),('FR'),('GE'),('GL'),('GR'),
('JU'),('LU'),('NE'),('NW'),('OW'),('SG'),('SH'),('SO'),('SZ'),('TG'),
('TI'),('UR'),('VD'),('VS'),('ZG'),('ZH');

INSERT INTO "swiss_canton_translations" ("canton_code", "language", "name") VALUES
('AG', 'de', 'Aargau'), ('AG', 'fr', 'Argovie'), ('AG', 'it', 'Argovia'), ('AG', 'en', 'Aargau'),
('AI', 'de', 'Appenzell Innerrhoden'), ('AI', 'fr', 'Appenzell Rhodes-Intérieures'), ('AI', 'it', 'Appenzello Interno'), ('AI', 'en', 'Appenzell Inner Rhodes'),
('AR', 'de', 'Appenzell Ausserrhoden'), ('AR', 'fr', 'Appenzell Rhodes-Extérieures'), ('AR', 'it', 'Appenzello Esterno'), ('AR', 'en', 'Appenzell Outer Rhodes'),
('BE', 'de', 'Bern'), ('BE', 'fr', 'Berne'), ('BE', 'it', 'Berna'), ('BE', 'en', 'Bern'),
('BL', 'de', 'Basel-Landschaft'), ('BL', 'fr', 'Bâle-Campagne'), ('BL', 'it', 'Basilea Campagna'), ('BL', 'en', 'Basel-Country'),
('BS', 'de', 'Basel-Stadt'), ('BS', 'fr', 'Bâle-Ville'), ('BS', 'it', 'Basilea Città'), ('BS', 'en', 'Basel-City'),
('FR', 'de', 'Freiburg'), ('FR', 'fr', 'Fribourg'), ('FR', 'it', 'Friburgo'), ('FR', 'en', 'Fribourg'),
('GE', 'de', 'Genf'), ('GE', 'fr', 'Genève'), ('GE', 'it', 'Ginevra'), ('GE', 'en', 'Geneva'),
('GL', 'de', 'Glarus'), ('GL', 'fr', 'Glaris'), ('GL', 'it', 'Glarona'), ('GL', 'en', 'Glarus'),
('GR', 'de', 'Graubünden'), ('GR', 'fr', 'Grisons'), ('GR', 'it', 'Grigioni'), ('GR', 'en', 'Graubünden'),
('JU', 'de', 'Jura'), ('JU', 'fr', 'Jura'), ('JU', 'it', 'Giura'), ('JU', 'en', 'Jura'),
('LU', 'de', 'Luzern'), ('LU', 'fr', 'Lucerne'), ('LU', 'it', 'Lucerna'), ('LU', 'en', 'Lucerne'),
('NE', 'de', 'Neuenburg'), ('NE', 'fr', 'Neuchâtel'), ('NE', 'it', 'Neuchâtel'), ('NE', 'en', 'Neuchâtel'),
('NW', 'de', 'Nidwalden'), ('NW', 'fr', 'Nidwald'), ('NW', 'it', 'Nidvaldo'), ('NW', 'en', 'Nidwalden'),
('OW', 'de', 'Obwalden'), ('OW', 'fr', 'Obwald'), ('OW', 'it', 'Obvaldo'), ('OW', 'en', 'Obwalden'),
('SG', 'de', 'St. Gallen'), ('SG', 'fr', 'Saint-Gall'), ('SG', 'it', 'San Gallo'), ('SG', 'en', 'St. Gallen'),
('SH', 'de', 'Schaffhausen'), ('SH', 'fr', 'Schaffhouse'), ('SH', 'it', 'Sciaffusa'), ('SH', 'en', 'Schaffhausen'),
('SO', 'de', 'Solothurn'), ('SO', 'fr', 'Soleure'), ('SO', 'it', 'Soletta'), ('SO', 'en', 'Solothurn'),
('SZ', 'de', 'Schwyz'), ('SZ', 'fr', 'Schwytz'), ('SZ', 'it', 'Svitto'), ('SZ', 'en', 'Schwyz'),
('TG', 'de', 'Thurgau'), ('TG', 'fr', 'Thurgovie'), ('TG', 'it', 'Turgovia'), ('TG', 'en', 'Thurgau'),
('TI', 'de', 'Tessin'), ('TI', 'fr', 'Tessin'), ('TI', 'it', 'Ticino'), ('TI', 'en', 'Ticino'),
('UR', 'de', 'Uri'), ('UR', 'fr', 'Uri'), ('UR', 'it', 'Uri'), ('UR', 'en', 'Uri'),
('VD', 'de', 'Waadt'), ('VD', 'fr', 'Vaud'), ('VD', 'it', 'Vaud'), ('VD', 'en', 'Vaud'),
('VS', 'de', 'Wallis'), ('VS', 'fr', 'Valais'), ('VS', 'it', 'Vallese'), ('VS', 'en', 'Valais'),
('ZG', 'de', 'Zug'), ('ZG', 'fr', 'Zoug'), ('ZG', 'it', 'Zugo'), ('ZG', 'en', 'Zug'),
('ZH', 'de', 'Zürich'), ('ZH', 'fr', 'Zurich'), ('ZH', 'it', 'Zurigo'), ('ZH', 'en', 'Zurich');

