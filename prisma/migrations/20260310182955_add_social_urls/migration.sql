/*
  Warnings:

  - You are about to drop the `operator_messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "operator_messages" DROP CONSTRAINT "operator_messages_club_id_fkey";

-- DropForeignKey
ALTER TABLE "support_messages" DROP CONSTRAINT "support_messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket_replies" DROP CONSTRAINT "ticket_replies_operator_id_fkey";

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "discord_url" TEXT,
ADD COLUMN     "facebook_url" TEXT,
ADD COLUMN     "github_url" TEXT,
ADD COLUMN     "instagram_url" TEXT,
ADD COLUMN     "telegram_url" TEXT,
ADD COLUMN     "tiktok_url" TEXT,
ADD COLUMN     "whatsapp_url" TEXT,
ADD COLUMN     "x_url" TEXT,
ADD COLUMN     "youtube_url" TEXT;

-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "discord_url" TEXT,
ADD COLUMN     "facebook_url" TEXT,
ADD COLUMN     "github_url" TEXT,
ADD COLUMN     "instagram_url" TEXT,
ADD COLUMN     "telegram_url" TEXT,
ADD COLUMN     "tiktok_url" TEXT,
ADD COLUMN     "whatsapp_url" TEXT,
ADD COLUMN     "x_url" TEXT,
ADD COLUMN     "youtube_url" TEXT;

-- AlterTable
ALTER TABLE "support_messages" ALTER COLUMN "sender_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ticket_replies" ALTER COLUMN "operator_id" DROP NOT NULL;

-- DropTable
DROP TABLE "operator_messages";

-- CreateIndex
CREATE INDEX "applications_status_submitted_at_idx" ON "applications"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "club_memberships_user_id_idx" ON "club_memberships"("user_id");

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
