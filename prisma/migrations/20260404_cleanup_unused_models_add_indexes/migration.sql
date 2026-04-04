-- DropForeignKey
ALTER TABLE "health_checks" DROP CONSTRAINT "health_checks_club_id_fkey";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "health_checks";

-- DropTable
DROP TABLE "migration_logs";

-- CreateIndex
CREATE INDEX "webauthn_credentials_user_id_idx" ON "webauthn_credentials"("user_id");

-- CreateIndex
CREATE INDEX "clubs_country_status_is_published_idx" ON "clubs"("country", "status", "is_published");
