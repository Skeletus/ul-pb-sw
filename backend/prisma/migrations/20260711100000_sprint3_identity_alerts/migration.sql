CREATE TABLE "roles" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  "description" VARCHAR(200),
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "permissions" (
  "id" SERIAL NOT NULL,
  "code" VARCHAR(75) NOT NULL,
  "description" VARCHAR(200),
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "role_permissions" (
  "role_id" INTEGER NOT NULL,
  "permission_id" INTEGER NOT NULL,
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id")
);
CREATE TABLE "alert_configurations" (
  "id" SERIAL NOT NULL,
  "machine_id" INTEGER NOT NULL,
  "inactivity_threshold_minutes" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "alert_configurations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");
CREATE UNIQUE INDEX "alert_configurations_machine_id_key" ON "alert_configurations"("machine_id");
INSERT INTO "roles" ("name", "description") VALUES ('SUPERVISOR', 'Default operational role');
ALTER TABLE "users" ADD COLUMN "role_id" INTEGER;
UPDATE "users" SET "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'SUPERVISOR') WHERE "role_id" IS NULL;
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;
CREATE INDEX "users_role_id_idx" ON "users"("role_id");
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alert_configurations" ADD CONSTRAINT "alert_configurations_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
