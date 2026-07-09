-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('REGISTERED', 'ACTIVE', 'INACTIVE', 'POWERED_ON_NO_PRODUCTIVE_USE', 'UNDER_DOCUMENTED_MAINTENANCE', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'RESOLVED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiration_date" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "location" VARCHAR(180),

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" SERIAL NOT NULL,
    "site_id" INTEGER NOT NULL,
    "code" VARCHAR(60) NOT NULL,
    "type" VARCHAR(80) NOT NULL,
    "current_status" "MachineStatus" NOT NULL DEFAULT 'REGISTERED',
    "hourly_rate" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" SERIAL NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vibration" DECIMAL(10,4) NOT NULL,
    "energy_consumption" DECIMAL(10,4) NOT NULL,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_state_records" (
    "id" SERIAL NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "status" "MachineStatus" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),

    CONSTRAINT "machine_state_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" SERIAL NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "priority" VARCHAR(30) NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "generation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_date" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "site_id" INTEGER NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "type" VARCHAR(60) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "file_url" VARCHAR(255),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inactivity_costs" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "inactive_hours" DECIMAL(10,2) NOT NULL,
    "contract_rate" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "inactivity_costs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "machines_code_key" ON "machines"("code");

-- CreateIndex
CREATE INDEX "machines_site_id_idx" ON "machines"("site_id");

-- CreateIndex
CREATE INDEX "sensor_readings_machine_id_timestamp_idx" ON "sensor_readings"("machine_id", "timestamp");

-- CreateIndex
CREATE INDEX "machine_state_records_machine_id_start_date_idx" ON "machine_state_records"("machine_id", "start_date");

-- CreateIndex
CREATE INDEX "alerts_machine_id_status_idx" ON "alerts"("machine_id", "status");

-- CreateIndex
CREATE INDEX "reports_site_id_idx" ON "reports"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_machine_id_type_start_date_end_date_key" ON "reports"("machine_id", "type", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "inactivity_costs_machine_id_idx" ON "inactivity_costs"("machine_id");

-- CreateIndex
CREATE UNIQUE INDEX "inactivity_costs_report_id_machine_id_key" ON "inactivity_costs"("report_id", "machine_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_state_records" ADD CONSTRAINT "machine_state_records_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inactivity_costs" ADD CONSTRAINT "inactivity_costs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inactivity_costs" ADD CONSTRAINT "inactivity_costs_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
