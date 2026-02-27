-- CreateIndex
CREATE INDEX "page_elements_club_id_page_id_idx" ON "page_elements"("club_id", "page_id");

-- AddForeignKey
ALTER TABLE "page_elements" ADD CONSTRAINT "page_elements_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
