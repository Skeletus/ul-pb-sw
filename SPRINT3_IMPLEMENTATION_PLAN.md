# WorkMeter Sprint 3 Implementation Plan

## 1. Current backend state

- NestJS modules currently cover authentication, machinery, telemetry, monitoring, alerts, reports, contracts, sensors, operational incidents, Prisma, and authenticated Socket.IO realtime.
- JWT sessions and password reset already exist. `OperationalIncident` is the implemented incident model and will remain unchanged.
- `Machine` currently has code, type, site, hourly rate, and current status. No RBAC, profile update, site listing, machinery update/decommission, alert configuration, report history range filters, or savings projection endpoints exist.

## 2. Current frontend state

- Next.js uses TanStack Query, Zustand authentication, and a realtime provider that invalidates machinery and alert queries.
- Dashboard, machinery, report, alert, contract/sensor/energy, PDF, password reset, and incident views exist.
- There are no profile, users, report history, alert configuration, role-aware navigation, or site-filtered dashboard views.

## 3. Existing endpoints to reuse

- `GET /auth/me`, `POST /auth/logout`, `POST /auth/reset-password`.
- `GET /machines`, `GET /machines/:id`, `GET /machines/:id/status`.
- `GET /reports/daily`, `GET /reports/daily/generated`, `GET /reports/usage-comparison`.
- `GET /alerts`, `GET /alerts/active`, and Socket.IO events `machine.status.changed`, `alert.created`, `alert.resolved`.

## 4. New or extended endpoints

- `PATCH /auth/me`, `POST /auth/change-password`.
- `GET /roles`, `GET /permissions`, `GET /users`, `POST /users/:id/role`.
- `GET /sites`, `GET /machines?siteId=`, `PATCH /machines/:id`, `PATCH /machines/:id/decommission`.
- `GET /reports/daily/generated?machineId=&from=&to=` and `GET /reports/savings-projection`.
- `GET /machines/:id/alert-configuration`, `PUT /machines/:id/alert-configuration`.

## 5. Prisma migrations

- Add `Role`, `Permission`, and `RolePermission`; add nullable-then-populated `roleId` to `User` with a default supervisor role before enforcing non-nullability.
- Add per-machine `AlertConfiguration` with a unique `machineId`.
- Add only indexes needed for role lookup and report history filters. Savings projection is calculated from existing state history and is not persisted.

## 6. New tables

- `roles`, `permissions`, `role_permissions`, and `alert_configurations`.

## 7. New columns

- `users.role_id` references `roles.id`.

## 8. Seed changes

- Seed idempotent `SUPERVISOR` and `ADMINISTRATOR` roles and the documented base permissions.
- Assign every existing user the supervisor role if unassigned; seed an administrator demo user.
- Preserve existing sites, machines, contracts, sensors, telemetry, reports, and `OperationalIncident` data.

## 9. New screens

- `/profile`, `/users`, and `/reports/history`.

## 10. Modified screens

- `/dashboard` and `/machinery` gain a site selector.
- `/machinery/new` uses a real site selector.
- `/machinery/[id]` gains administrator-only edit, decommission, and alert configuration controls.
- `/reports` gains savings projection.

## 11. New or extended frontend components

- Role-aware navigation and route guard, site selector, machine edit/decommission form, alert configuration form, report history line chart, and savings projection card.

## 12. Regression risks

- Adding role ownership must not invalidate existing JWT sessions or lock existing users out.
- Existing machine list and report endpoints must retain unfiltered responses.
- Decommissioned machines must retain historic telemetry, alerts, reports, and incidents while stopping monitoring and alerts.
- Realtime invalidation must remain compatible with the existing machine and alert event payloads.

## 13. Non-regression strategy

- Keep all existing routes and response fields unchanged.
- Seed and migration assign a default role to every existing user.
- Apply `RolesGuard` only to the new administrative operations required by Sprint 3.
- Run all existing and new Jest/Vitest tests, Prisma validation/migration/seed, lint, type-check, and builds.

## 14. Test strategy

- Backend: profile/password change, RBAC assignment and rejection, machine update/decommission, site filter, custom alert threshold fallback, report history filters, and savings formula.
- Frontend: role visibility, site filters, report history/savings states, and realtime invalidation scope.
- Existing Sprint 1–2 authentication, telemetry, monitoring, alerts, reports, contracts, sensors, incidents, and PDF tests remain part of the full suite.

## 15. Documentation updates

- Update `API_CONTRACT.md`, backend/frontend implementation plans and READMEs, `.env.example`, and affected PlantUML class, ERD, DDD, component, deployment, use-case, and sequence diagrams.
