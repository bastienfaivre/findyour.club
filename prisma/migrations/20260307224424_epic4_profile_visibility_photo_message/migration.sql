-- DropForeignKey
ALTER TABLE "operator_nudges" DROP CONSTRAINT "operator_nudges_club_id_fkey";

-- AlterTable: Application - add new profile fields
ALTER TABLE "applications" ADD COLUMN     "contact_address" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "external_website_url" TEXT,
ADD COLUMN     "how_to_join" TEXT,
ADD COLUMN     "schedule" TEXT;

-- AlterTable: Club - rename welcome_text to description (preserves data)
ALTER TABLE "clubs" RENAME COLUMN "welcome_text" TO "description";

-- AlterTable: Club - add new profile and visibility fields
ALTER TABLE "clubs" ADD COLUMN     "contact_address" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "external_website_url" TEXT,
ADD COLUMN     "force_offline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "how_to_join" TEXT,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "schedule" TEXT;

-- DropTable
DROP TABLE "operator_nudges";

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
CREATE TABLE "operator_messages" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "operator_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_photos_club_id_idx" ON "club_photos"("club_id");

-- CreateIndex
CREATE INDEX "operator_messages_club_id_idx" ON "operator_messages"("club_id");

-- AddForeignKey
ALTER TABLE "club_photos" ADD CONSTRAINT "club_photos_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_messages" ADD CONSTRAINT "operator_messages_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
