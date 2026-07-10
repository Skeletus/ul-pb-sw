# WorkMeter Frontend

Aplicacion web autenticada para operar el MVP de WorkMeter. Consume exclusivamente los endpoints documentados en `../API_CONTRACT.md`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Zustand
- ESLint

## Requisitos previos

- Node.js 20 o superior.
- npm.
- Backend WorkMeter levantado y con seed ejecutado.

## Variables de entorno

Copia `.env.example` a `.env.local` dentro de `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

El cliente agrega el prefijo `/api` automaticamente.

## Instalacion

```bash
cd frontend
npm install
```

## Correr el proyecto

```bash
cd frontend
npm run dev
```

La app queda disponible normalmente en `http://localhost:3000`.

## Conexion con backend

El backend debe estar disponible en:

```text
http://localhost:3001/api
```

El token JWT se envia como:

```http
Authorization: Bearer <token>
```

El mismo token se envia como `auth.token` al namespace Socket.IO `/realtime`. El cliente se reconecta automaticamente, conserva la aplicacion operativa durante cortes y vuelve a consultar maquinaria y alertas al recuperar la conexion.

## Rutas principales

- `/login`
- `/dashboard`
- `/machinery`
- `/machinery/new`
- `/machinery/[id]`
- `/reports`
- `/alerts`

## Pantallas incluidas

- Login seguro.
- Dashboard con maquinas y alertas activas.
- Listado de maquinaria.
- Registro de maquinaria.
- Detalle de maquinaria con estado y telemetria reciente.
- Reporte diario por maquina y fecha.
- Listado de reportes generados automaticamente al cierre de jornada.
- Alertas activas e historial.
- Recuperacion y restablecimiento de contraseña.
- Contrato, sensor y consumo energetico en detalle de maquinaria.
- Detalle de alerta e incidencias persistidas.
- Comparacion de utilizacion/costos y descarga PDF real.

Los horarios y la zona de los reportes se configuran en el backend mediante `WORKDAY_START`, `WORKDAY_END` y `WORK_TIMEZONE`.

## Pantallas no incluidas

No se incluyen porque no hay endpoints en `API_CONTRACT.md`:

- Contratos.
- Asociacion formal de sensores.
- Recuperacion de contrasena.
- Exportacion PDF.
- Roles y permisos.
- Auditoria.
- Incidencias.
- Mantenimiento.
- Dashboard multi-obra avanzado.
- Reporte final de optimizacion.
- Ahorro proyectado, tendencias y recomendaciones.

## Usuario demo

Segun `API_CONTRACT.md` y el seed del backend:

```text
email: demo@workmeter.com
password: Demo123456
```

## Problemas comunes

- `401 Unauthorized`: vuelve a iniciar sesion; la app limpia la sesion local automaticamente.
- `Failed to fetch`: verifica que el backend este levantado y que `NEXT_PUBLIC_API_BASE_URL` apunte al puerto correcto.
- `Site not found` al registrar maquinaria: usa un `siteId` existente en la base de datos; el seed crea la obra con `id` 1.
- Sin datos en dashboard: ejecuta el seed del backend o registra maquinaria desde `/machinery/new`.

## Validaciones

```bash
npm run typecheck
npm run lint
npm run build
```
