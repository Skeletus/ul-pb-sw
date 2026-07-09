# WorkMeter Backend

API REST independiente para el MVP Sprint 1 de WorkMeter. Implementa autenticacion, maquinaria, telemetria simulada, clasificacion activa/inactiva, alertas visuales por inactividad, reporte diario y costo estimado por inactividad.

## Stack

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker Compose
- JWT con Passport.js
- class-validator y class-transformer
- Swagger

## Requisitos previos

- Node.js 20 o superior.
- npm.
- Docker Desktop o Docker Engine.

## Variables de entorno

Copiar `.env.example` a `.env` dentro de `backend/` y ajustar valores si hace falta.

Variables principales:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `CORS_ORIGIN`
- `VIBRATION_THRESHOLD`
- `ENERGY_THRESHOLD`
- `INACTIVITY_THRESHOLD_MINUTES`
- `ALERT_THRESHOLD_MINUTES`

## Levantar PostgreSQL con Docker

```bash
cd backend
docker compose up -d
```

El servicio expone PostgreSQL en `localhost:5432` con base de datos `workmeter`.

## Instalar dependencias

```bash
cd backend
npm install
```

## Ejecutar migraciones Prisma

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## Ejecutar seed

```bash
cd backend
npm run seed
```

Usuario demo:

```text
email: demo@workmeter.com
password: Demo123456
```

La contrasena se guarda hasheada con bcrypt.

## Iniciar backend en desarrollo

```bash
cd backend
npm run start:dev
```

La API queda disponible en:

```text
http://localhost:3001/api
```

## Swagger

```text
http://localhost:3001/api/docs
```

## Ejecutar simulador de telemetria

Con la API levantada y el seed ejecutado:

```bash
cd backend
npm run simulator
```

El simulador inicia sesion con el usuario demo, consulta las maquinas existentes y envia lecturas periodicas al endpoint real `POST /api/telemetry`. No inserta datos directamente con Prisma.

## Endpoints principales

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/machines`
- `GET /api/machines`
- `GET /api/machines/:id`
- `GET /api/machines/:id/status`
- `POST /api/telemetry`
- `GET /api/telemetry/machine/:machineId`
- `GET /api/alerts/active`
- `GET /api/alerts`
- `GET /api/alerts/:id`
- `GET /api/reports/daily?machineId=1&date=2026-07-08`

## MVP Sprint 1

Incluido:

- HU01: iniciar sesion de forma segura.
- HU02: registrar nueva maquinaria.
- HU03: visualizar estado activo o inactivo.
- HU04: generar reporte diario.
- HU05: recibir alerta visual por inactividad prolongada.
- HU06: visualizar costo estimado por inactividad.

Pendiente para sprints futuros:

- RBAC completo.
- Recuperacion de contrasena.
- Contratos completos de alquiler.
- Asociacion formal de sensores.
- Incidencias operativas.
- Notificaciones reales.
- Exportacion PDF.
- WebSockets.
- Auditoria.
- Mantenimiento.
- Optimizacion, tendencias, ahorro proyectado y recomendaciones.

## Pruebas

```bash
cd backend
npm test
```

Las pruebas cubren:

- Clasificacion activa/inactiva.
- Generacion y no duplicacion de alertas.
- Horas activas, horas inactivas y costo por inactividad.
