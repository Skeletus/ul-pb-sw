# WorkMeter Frontend Implementation Plan

## 1. Resumen del alcance del frontend MVP

La aplicacion autenticada de WorkMeter cubrira exclusivamente el Sprint 1 soportado por `API_CONTRACT.md`:

- Login seguro con JWT.
- Registro basico de maquinaria.
- Listado, detalle y estado de maquinaria.
- Consulta de telemetria reciente por maquinaria.
- Reporte diario de uso efectivo y costo por inactividad.
- Visualizacion de alertas activas e historial de alertas.
- Sincronizacion de estados y alertas mediante eventos autenticados de `/realtime`.
- Consulta de reportes diarios generados automaticamente.

No se implementaran funciones que no tengan endpoint documentado en `API_CONTRACT.md`.

## 2. Pantallas que se van a crear

- `/login`: inicio de sesion.
- `/dashboard`: resumen operativo con maquinas, estados, alertas activas y metricas calculables desde respuestas reales.
- `/machinery`: listado de maquinaria.
- `/machinery/new`: registro de maquinaria.
- `/machinery/[id]`: detalle de maquinaria, estado y telemetria reciente.
- `/reports`: consulta de reporte diario por maquina y fecha.
- `/alerts`: alertas activas e historial.
- `/`: redireccion a `/dashboard` si hay sesion o a `/login` si no la hay.

## 3. Endpoints de API_CONTRACT.md que consumira cada pantalla

- `/login`
  - `POST /api/auth/login`
  - `GET /api/auth/me` para redireccionar si ya hay sesion valida
- Layout autenticado
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- `/dashboard`
  - `GET /api/machines`
  - `GET /api/alerts/active`
- `/machinery`
  - `GET /api/machines`
- `/machinery/new`
  - `POST /api/machines`
- `/machinery/[id]`
  - `GET /api/machines/:id`
  - `GET /api/machines/:id/status`
  - `GET /api/telemetry/machine/:machineId`
  - `GET /api/alerts`
- `/reports`
  - `GET /api/machines`
  - `GET /api/reports/daily?machineId=<id>&date=<YYYY-MM-DD>`
  - `GET /api/reports/daily/generated`
- `/alerts`
  - `GET /api/alerts/active`
  - `GET /api/alerts`

## 4. Modelos TypeScript que se crearan a partir del contrato

- `MachineStatus`
- `AlertStatus`
- `AlertPriority`
- `ReportType`
- `AuthUser`
- `CurrentUser`
- `AuthResponse`
- `Site`
- `Machine`
- `MachineWithSite`
- `MachineStatusResponse`
- `SensorReading`
- `MachineStateRecord`
- `MachineWithLatestState`
- `TelemetryCreateResponse`
- `Alert`
- `AlertWithMachine`
- `DailyReport`
- `ApiError`

Tambien se crearan tipos de request estrictamente derivados de DTOs documentados:

- `LoginRequest`
- `CreateMachineRequest`
- `DailyReportQuery`

## 5. Flujos bloqueados por falta de endpoint

Bloqueado por falta de endpoint en API_CONTRACT.md:

- Gestion de contratos de alquiler.
- Asociacion formal de sensores.
- Recuperacion y reseteo de contrasena.
- Gestion de usuarios, roles y permisos.
- Dashboard backend dedicado o endpoint `/dashboard`.
- Simulacion de telemetria desde la UI como flujo principal (`POST /api/telemetry` existe, pero no se requiere pantalla de simulacion en Sprint 1 solicitado).
- Edicion o baja de maquinaria.
- Registro y gestion de incidencias.
- Cambio manual de estado de alertas.
- Configuracion de alertas.
- Exportacion PDF/Excel/CSV.
- Reportes historicos, finales u optimizacion.
- Costos comparativos, ahorro proyectado, tendencias y recomendaciones.
- Auditoria.
- Mantenimiento documental.

## 6. Estructura de carpetas propuesta

```text
frontend/
├── app/
├── components/
│   ├── alerts/
│   ├── layout/
│   ├── machinery/
│   ├── reports/
│   └── ui/
├── features/
│   ├── alerts/
│   ├── auth/
│   ├── machinery/
│   ├── reports/
│   └── telemetry/
├── hooks/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── query-client.ts
│   ├── routes.ts
│   └── utils.ts
├── public/
├── styles/
└── types/
```

## 7. Decisiones tecnicas asumidas

- Next.js App Router con TypeScript estricto.
- Tailwind CSS con paleta tomada de la landing: azul oscuro, azul, naranja, cyan, concreto y blanco.
- TanStack Query para cache, loading, error states e invalidaciones.
- React Hook Form + Zod para formularios.
- Zustand para estado de autenticacion por simplicidad del MVP.
- Token JWT persistido en `localStorage`, porque `API_CONTRACT.md` no especifica mecanismo de almacenamiento.
- `NEXT_PUBLIC_API_BASE_URL` apuntara a `http://localhost:3001`; el cliente API agregara el prefijo `/api`.
- No se agregaran librerias de graficos para evitar complejidad no requerida; las metricas se mostraran en tarjetas y tablas.

## 8. Validaciones de formularios

- Login:
  - `email`: email valido.
  - `password`: string, minimo 8 caracteres.
- Crear maquinaria:
  - `siteId`: entero positivo.
  - `code`: string requerido, maximo 60 caracteres.
  - `type`: string requerido, maximo 80 caracteres.
  - `hourlyRate`: opcional, numero mayor o igual a 0, maximo 2 decimales.
- Reporte diario:
  - `machineId`: entero positivo seleccionado desde `GET /api/machines`.
  - `date`: string en formato `YYYY-MM-DD`.

## 9. Estrategia de autenticacion

- Guardar `accessToken` y usuario base del login en `localStorage`.
- En el arranque de rutas protegidas, si hay token, llamar `GET /api/auth/me` para validar sesion.
- Cada request protegida enviara `Authorization: Bearer <token>`.
- El cliente Socket.IO enviara el token en `auth.token`, reintentara la conexion y, en cada reconexion, invalidara consultas de maquinaria y alertas para recuperar el estado REST vigente.
- Si cualquier request devuelve `401`, limpiar sesion y redirigir a `/login`.
- `logout` llamara `POST /api/auth/logout` si hay token; despues limpiara estado local.

## 10. Estrategia de manejo de errores, loading y empty states

- Todas las pantallas con datos usaran TanStack Query.
- Loading: skeletons o bloques de carga consistentes.
- Error: componente `ErrorState` con mensaje derivado de `ApiError`.
- Empty state:
  - Sin maquinaria: "Aun no hay maquinaria registrada."
  - Sin alertas activas: "No hay alertas activas."
  - Sin telemetria: "No hay lecturas recientes para esta maquinaria."
  - Sin reporte consultado: "Selecciona una maquina y fecha para consultar el reporte."
- `401`: limpieza de sesion y redireccion a `/login`.
- `500`/errores desconocidos: mensaje general sin exponer detalles tecnicos internos.

## 11. Sprint 2 implementado

- `/forgot-password` y `/reset-password` consumen los endpoints publicos de recuperacion.
- El detalle de maquinaria administra contrato/sensor y consulta consumo real por rango.
- El detalle de alerta registra y lista incidencias.
- `/reports` compara multiples maquinas, resalta baja utilizacion y descarga el PDF del backend.
