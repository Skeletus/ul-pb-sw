-- Link alerts to a single continuous inactivity period.
ALTER TABLE "alerts" ADD COLUMN "state_record_id" INTEGER;

-- Persist calculated daily report metrics for automatic retrieval.
ALTER TABLE "reports"
ADD COLUMN "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "active_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "inactive_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "total_classified_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "effective_usage_percentage" DECIMAL(5,2);

CREATE UNIQUE INDEX "alerts_state_record_id_key" ON "alerts"("state_record_id");

-- PostgreSQL partial uniqueness guarantees one open state period per machine.
CREATE UNIQUE INDEX "machine_state_records_one_open_per_machine_key"
ON "machine_state_records"("machine_id")
WHERE "end_date" IS NULL;

ALTER TABLE "alerts" ADD CONSTRAINT "alerts_state_record_id_fkey"
FOREIGN KEY ("state_record_id") REFERENCES "machine_state_records"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
