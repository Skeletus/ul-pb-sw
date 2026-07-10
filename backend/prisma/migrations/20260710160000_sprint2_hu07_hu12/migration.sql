CREATE TYPE "ContractStatus" AS ENUM ('VALID', 'EXPIRED', 'CANCELLED', 'RENEWED');
CREATE TYPE "SensorStatus" AS ENUM ('AVAILABLE', 'ASSOCIATED', 'ACTIVE', 'DISCONNECTED', 'ERROR');
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE "password_reset_tokens" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "token_hash" VARCHAR(64) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "consumed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rental_contracts" (
  "id" SERIAL NOT NULL,
  "machine_id" INTEGER NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "duration_days" INTEGER NOT NULL,
  "total_cost" DECIMAL(12,2) NOT NULL,
  "hourly_rate" DECIMAL(10,2) NOT NULL,
  "status" "ContractStatus" NOT NULL DEFAULT 'VALID',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rental_contracts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sensors" (
  "id" SERIAL NOT NULL,
  "machine_id" INTEGER,
  "identifier" VARCHAR(80) NOT NULL,
  "type" VARCHAR(60) NOT NULL,
  "status" "SensorStatus" NOT NULL DEFAULT 'AVAILABLE',
  "installed_at" TIMESTAMP(3),
  "last_connection_at" TIMESTAMP(3),
  CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "sensor_readings" ADD COLUMN "sensor_id" INTEGER;

CREATE TABLE "operational_incidents" (
  "id" SERIAL NOT NULL,
  "alert_id" INTEGER NOT NULL,
  "machine_id" INTEGER NOT NULL,
  "site_id" INTEGER NOT NULL,
  "registered_by_id" INTEGER NOT NULL,
  "title" VARCHAR(120) NOT NULL,
  "description" VARCHAR(1000) NOT NULL,
  "severity" "IncidentSeverity" NOT NULL,
  "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
  "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operational_incidents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");
CREATE INDEX "password_reset_tokens_user_id_expires_at_idx" ON "password_reset_tokens"("user_id", "expires_at");
CREATE INDEX "rental_contracts_machine_id_status_idx" ON "rental_contracts"("machine_id", "status");
CREATE UNIQUE INDEX "rental_contracts_one_valid_per_machine_key" ON "rental_contracts"("machine_id") WHERE "status" = 'VALID';
CREATE UNIQUE INDEX "sensors_machine_id_key" ON "sensors"("machine_id");
CREATE UNIQUE INDEX "sensors_identifier_key" ON "sensors"("identifier");
CREATE INDEX "sensors_status_idx" ON "sensors"("status");
CREATE INDEX "sensor_readings_sensor_id_timestamp_idx" ON "sensor_readings"("sensor_id", "timestamp");
CREATE INDEX "operational_incidents_alert_id_registration_date_idx" ON "operational_incidents"("alert_id", "registration_date");
CREATE INDEX "operational_incidents_machine_id_registration_date_idx" ON "operational_incidents"("machine_id", "registration_date");
CREATE INDEX "operational_incidents_site_id_idx" ON "operational_incidents"("site_id");

ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "operational_incidents" ADD CONSTRAINT "operational_incidents_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "operational_incidents" ADD CONSTRAINT "operational_incidents_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "operational_incidents" ADD CONSTRAINT "operational_incidents_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "operational_incidents" ADD CONSTRAINT "operational_incidents_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
