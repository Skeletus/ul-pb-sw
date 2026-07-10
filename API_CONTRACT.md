# WorkMeter API Contract

Este contrato documenta exclusivamente lo que esta implementado en `backend/`.
No incluye endpoints ni modelos que solo aparecen como plan en `ContextMD.md` o en `diagrams/`.

## 1. Encabezado general

- **Base URL local por defecto:** `http://localhost:3001/api`
- **Puerto real:** `PORT` desde variables de entorno; fallback `3001`.
- **Swagger:** `http://localhost:3001/api/docs`
- **Autenticacion:** JWT Bearer en header:

```http
Authorization: Bearer <token>
```

- **Roles:** no hay RBAC ni roles implementados. Los endpoints protegidos solo validan JWT, sesion existente/no expirada y usuario con `status === "ACTIVE"`.
- **Fechas/horas:** los `Date` de Nest/Prisma se serializan como strings ISO 8601, normalmente UTC con sufijo `Z`, por ejemplo `2026-07-08T08:00:00.000Z`.
- **Reportes diarios:** `date` identifica la fecha local de inicio de jornada. La ventana se obtiene de `WORKDAY_START`, `WORKDAY_END` y `WORK_TIMEZONE`; los valores predeterminados son `08:00`, `17:00` y `America/Lima`.
- **Decimales Prisma:** los campos `Decimal` persistidos por Prisma se devuelven como strings en JSON, por ejemplo `"120"` o `"12.4000"`. Los calculos de reportes se devuelven como numbers.

### Formato estandar de error real

El backend usa el formato estandar de NestJS. Existe `HttpExceptionFilter`, pero no esta registrado en `main.ts`, por lo que no agrega `path` ni `timestamp`.

Error HTTP comun:

```json
{
  "message": "Machine not found",
  "error": "Not Found",
  "statusCode": 404
}
```

Error de validacion por DTO o `ParseIntPipe`:

```json
{
  "message": [
    "siteId must be a positive number",
    "code must be shorter than or equal to 60 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

La `ValidationPipe` global esta configurada con:

- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`
- `enableImplicitConversion: true`

## 2. Endpoints por modulo

## Auth

### POST /api/auth/login

**Descripcion:** Autentica un usuario activo y crea una sesion JWT.

**Requiere autenticacion:** No.

**Request:**

- Path params: no aplica.
- Query params: no aplica.
- Body:

Campos TypeScript:

```ts
{
  email: string; // email valido
  password: string; // minimo 8 caracteres
}
```

Ejemplo JSON:

```json
{
  "email": "demo@workmeter.com",
  "password": "Demo123456"
}
```

**Response exitosa (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Demo Supervisor",
    "email": "demo@workmeter.com",
    "status": "ACTIVE"
  }
}
```

Campos TypeScript:

```ts
{
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    status: string;
  };
}
```

**Posibles errores:**

- `400`: el body no cumple `LoginDto` (`email` invalido, `password` menor a 8, campos extra no permitidos).
- `401`: credenciales invalidas, usuario inexistente o usuario con `status` distinto de `"ACTIVE"`.

### POST /api/auth/logout

**Descripcion:** Cierra la sesion actual marcando `expirationDate`.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params: no aplica.
- Query params: no aplica.
- Body: no aplica.

**Response exitosa (201):**

```json
{
  "message": "Session closed"
}
```

Campos TypeScript:

```ts
{
  message: string;
}
```

**Posibles errores:**

- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.

### GET /api/auth/me

**Descripcion:** Devuelve el usuario autenticado actual.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params: no aplica.
- Query params: no aplica.
- Body: no aplica.

**Response exitosa (200):**

```json
{
  "id": 1,
  "name": "Demo Supervisor",
  "email": "demo@workmeter.com",
  "status": "ACTIVE",
  "createdAt": "2026-07-08T22:56:11.000Z"
}
```

Campos TypeScript:

```ts
{
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}
```

**Posibles errores:**

- `401`: token ausente, invalido, expirado, sesion invalida/expirada, usuario inactivo o usuario no encontrado.

## Machinery

### POST /api/machines

**Descripcion:** Registra una nueva maquinaria asociada a una obra existente (`Site`).

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params: no aplica.
- Query params: no aplica.
- Body:

Campos TypeScript:

```ts
{
  siteId: number; // entero positivo
  code: string; // maximo 60 caracteres, unico
  type: string; // maximo 80 caracteres
  hourlyRate?: number; // >= 0, maximo 2 decimales
}
```

Ejemplo JSON:

```json
{
  "siteId": 1,
  "code": "MACH-004",
  "type": "Cargador Frontal",
  "hourlyRate": 135.5
}
```

**Response exitosa (201):**

`POST /api/machines` no incluye `site` en la respuesta.

```json
{
  "id": 4,
  "siteId": 1,
  "code": "MACH-004",
  "type": "Cargador Frontal",
  "currentStatus": "REGISTERED",
  "hourlyRate": "135.5"
}
```

Campos TypeScript:

```ts
{
  id: number;
  siteId: number;
  code: string;
  type: string;
  currentStatus: MachineStatus;
  hourlyRate: string;
}
```

**Posibles errores:**

- `400`: validacion fallida del DTO o campos extra no permitidos.
- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.
- `404`: `siteId` no existe (`"Site not found"`).
- `409`: `code` ya existe (`"Machine code already exists"`).

### GET /api/machines

**Descripcion:** Lista todas las maquinarias ordenadas por `id` ascendente.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params: no aplica.
- Query params: no aplica.
- Body: no aplica.

**Response exitosa (200):**

`GET /api/machines` incluye la relacion `site`.

```json
[
  {
    "id": 1,
    "siteId": 1,
    "code": "MACH-001",
    "type": "Excavadora",
    "currentStatus": "INACTIVE",
    "hourlyRate": "120",
    "site": {
      "id": 1,
      "name": "Obra Residencial Los Olivos",
      "location": "Lima"
    }
  },
  {
    "id": 2,
    "siteId": 1,
    "code": "MACH-002",
    "type": "Retroexcavadora",
    "currentStatus": "REGISTERED",
    "hourlyRate": "95",
    "site": {
      "id": 1,
      "name": "Obra Residencial Los Olivos",
      "location": "Lima"
    }
  }
]
```

Campos TypeScript:

```ts
MachineWithSite[]
```

**Posibles errores:**

- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.

### GET /api/machines/:id

**Descripcion:** Obtiene el detalle de una maquinaria por `id`.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params:
  - `id`: `number`, entero. Ejemplo: `1`.
- Query params: no aplica.
- Body: no aplica.

**Response exitosa (200):**

```json
{
  "id": 1,
  "siteId": 1,
  "code": "MACH-001",
  "type": "Excavadora",
  "currentStatus": "INACTIVE",
  "hourlyRate": "120",
  "site": {
    "id": 1,
    "name": "Obra Residencial Los Olivos",
    "location": "Lima"
  }
}
```

Campos TypeScript:

```ts
MachineWithSite
```

**Posibles errores:**

- `400`: `id` no es numerico.
- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.
- `404`: la maquinaria no existe (`"Machine not found"`).

### GET /api/machines/:id/status

**Descripcion:** Obtiene el estado actual de una maquinaria y la fecha de inicio del ultimo estado registrado.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params:
  - `id`: `number`, entero. Ejemplo: `1`.
- Query params: no aplica.
- Body: no aplica.

**Response exitosa (200):**

```json
{
  "machineId": 1,
  "code": "MACH-001",
  "currentStatus": "INACTIVE",
  "lastStateStartDate": "2026-07-08T10:00:00.000Z"
}
```

Campos TypeScript:

```ts
{
  machineId: number;
  code: string;
  currentStatus: MachineStatus;
  lastStateStartDate: string | null;
}
```

**Posibles errores:**

- `400`: `id` no es numerico.
- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.
- `404`: la maquinaria no existe (`"Machine not found"`).

## Telemetry

### POST /api/telemetry

**Descripcion:** Guarda una lectura de telemetria, clasifica el estado de la maquina y puede resolver o crear alertas.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params: no aplica.
- Query params: no aplica.
- Body:

Campos TypeScript:

```ts
{
  machineId: number; // entero positivo
  vibrationValue: number; // 0 a 100, maximo 4 decimales
  energyConsumption: number; // 0 a 100000, maximo 4 decimales
  timestamp?: string; // ISO 8601
}
```

Ejemplo JSON:

```json
{
  "machineId": 1,
  "vibrationValue": 0.82,
  "energyConsumption": 14.35,
  "timestamp": "2026-07-08T08:15:00.000Z"
}
```

**Response exitosa (201):**

```json
{
  "reading": {
    "id": 10,
    "machineId": 1,
    "timestamp": "2026-07-08T08:15:00.000Z",
    "vibration": "0.82",
    "energyConsumption": "14.35"
  },
  "machineState": {
    "id": 1,
    "siteId": 1,
    "code": "MACH-001",
    "type": "Excavadora",
    "currentStatus": "ACTIVE",
    "hourlyRate": "120",
    "machineStateRecords": [
      {
        "id": 7,
        "machineId": 1,
        "status": "ACTIVE",
        "startDate": "2026-07-08T08:15:00.000Z",
        "endDate": null
      }
    ]
  }
}
```

Campos TypeScript:

```ts
{
  reading: SensorReading;
  machineState: MachineWithLatestState | null;
}
```

**Posibles errores:**

- `400`: validacion fallida del DTO o campos extra no permitidos.
- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.
- `404`: `machineId` no existe (`"Machine not found"`).
- `400`: el `timestamp` no es posterior a la ultima lectura aceptada para la maquina. Las lecturas fuera de orden y timestamps duplicados se rechazan para conservar una linea temporal determinista.

### GET /api/telemetry/machine/:machineId

**Descripcion:** Lista las ultimas 100 lecturas de una maquina, ordenadas por `timestamp` descendente.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params:
  - `machineId`: `number`, entero. Ejemplo: `1`.
- Query params: no aplica.
- Body: no aplica.

**Response exitosa (200):**

```json
[
  {
    "id": 10,
    "machineId": 1,
    "timestamp": "2026-07-08T08:15:00.000Z",
    "vibration": "0.82",
    "energyConsumption": "14.35"
  },
  {
    "id": 9,
    "machineId": 1,
    "timestamp": "2026-07-08T08:10:00.000Z",
    "vibration": "0.12",
    "energyConsumption": "2.1"
  }
]
```

Campos TypeScript:

```ts
SensorReading[]
```

**Posibles errores:**

- `400`: `machineId` no es numerico.
- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.
- `404`: la maquinaria no existe (`"Machine not found"`).

## Reports

### GET /api/reports/daily

**Descripcion:** Genera o actualiza idempotentemente un reporte para la jornada local configurada de una maquina. Los estados distintos de `ACTIVE` e `INACTIVE` no se contabilizan.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params: no aplica.
- Query params:
  - `machineId`: `number`, obligatorio, entero positivo. Ejemplo: `1`.
  - `date`: `string`, obligatorio, fecha ISO aceptada por `@IsDateString`. Ejemplo: `2026-07-08`.
- Body: no aplica.

Ejemplo:

```http
GET /api/reports/daily?machineId=1&date=2026-07-08
```

**Response exitosa (200):**

```json
{
  "reportId": 1,
  "machineId": 1,
  "machineCode": "MACH-001",
  "siteId": 1,
  "siteName": "Obra Residencial Los Olivos",
  "date": "2026-07-08",
  "periodStart": "2026-07-08T13:00:00.000Z",
  "periodEnd": "2026-07-08T22:00:00.000Z",
  "generatedAt": "2026-07-08T22:00:00.000Z",
  "activeHours": 2,
  "inactiveHours": 0.75,
  "totalClassifiedHours": 2.75,
  "effectiveUsagePercentage": 72.73,
  "hourlyRate": 120,
  "inactivityCost": 90,
  "hasData": true
}
```

Campos TypeScript:

```ts
DailyReport
```

**Posibles errores:**

- `400`: `machineId` o `date` no cumplen `DailyReportQueryDto`, o hay query params extra.
- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.
- `404`: la maquinaria no existe (`"Machine not found"`).

Si no hay intervalos `ACTIVE` o `INACTIVE`, `activeHours`, `inactiveHours` y `totalClassifiedHours` son `0`, `effectiveUsagePercentage` es `null` y `hasData` es `false`.

### GET /api/reports/daily/generated

**Descripcion:** Lista reportes diarios persistidos, incluidos los creados automaticamente al cierre de jornada y los generados por consulta manual.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Query params opcionales:**

- `machineId`: entero positivo.
- `date`: fecha exacta `YYYY-MM-DD` interpretada con la configuracion de jornada.

**Response exitosa (200):** `DailyReport[]`, ordenado por inicio de jornada descendente y maquina ascendente.

**Posibles errores:**

- `400`: filtros invalidos o query params extra.
- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.

## Alerts

### GET /api/alerts/active

**Descripcion:** Lista las alertas activas ordenadas por `generationDate` descendente.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params: no aplica.
- Query params: no aplica.
- Body: no aplica.

**Response exitosa (200):**

```json
[
  {
    "id": 1,
    "machineId": 1,
    "priority": "HIGH",
    "status": "ACTIVE",
    "generationDate": "2026-07-08T10:45:00.000Z",
    "resolvedDate": null,
    "machine": {
      "id": 1,
      "siteId": 1,
      "code": "MACH-001",
      "type": "Excavadora",
      "currentStatus": "INACTIVE",
      "hourlyRate": "120",
      "site": { "id": 1, "name": "Obra Residencial Los Olivos", "location": "Lima" }
    },
    "stateRecordId": 7,
    "inactiveSince": "2026-07-08T10:05:00.000Z",
    "inactiveDurationMinutes": 40
  }
]
```

Campos TypeScript:

```ts
AlertWithMachine[]
```

**Posibles errores:**

- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.

### GET /api/alerts

**Descripcion:** Lista todas las alertas ordenadas por `generationDate` descendente.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params: no aplica.
- Query params: no aplica.
- Body: no aplica.

**Response exitosa (200):**

```json
[
  {
    "id": 2,
    "machineId": 1,
    "priority": "HIGH",
    "status": "RESOLVED",
    "generationDate": "2026-07-08T09:30:00.000Z",
    "resolvedDate": "2026-07-08T09:50:00.000Z",
    "machine": {
      "id": 1,
      "siteId": 1,
      "code": "MACH-001",
      "type": "Excavadora",
      "currentStatus": "ACTIVE",
      "hourlyRate": "120"
    }
  },
  {
    "id": 1,
    "machineId": 1,
    "priority": "HIGH",
    "status": "ACTIVE",
    "generationDate": "2026-07-08T10:45:00.000Z",
    "resolvedDate": null,
    "machine": {
      "id": 1,
      "siteId": 1,
      "code": "MACH-001",
      "type": "Excavadora",
      "currentStatus": "INACTIVE",
      "hourlyRate": "120"
    }
  }
]
```

Campos TypeScript:

```ts
AlertWithMachine[]
```

**Posibles errores:**

- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.

### GET /api/alerts/:id

**Descripcion:** Obtiene el detalle de una alerta por `id`.

**Requiere autenticacion:** Si, JWT Bearer. Sin roles.

**Request:**

- Path params:
  - `id`: `number`, entero. Ejemplo: `1`.
- Query params: no aplica.
- Body: no aplica.

**Response exitosa (200):**

```json
{
  "id": 1,
  "machineId": 1,
  "priority": "HIGH",
  "status": "ACTIVE",
  "generationDate": "2026-07-08T10:45:00.000Z",
  "resolvedDate": null,
  "machine": {
    "id": 1,
    "siteId": 1,
    "code": "MACH-001",
    "type": "Excavadora",
    "currentStatus": "INACTIVE",
    "hourlyRate": "120"
  }
}
```

Campos TypeScript:

```ts
AlertWithMachine
```

**Posibles errores:**

- `400`: `id` no es numerico.
- `401`: token ausente, invalido, expirado, sesion invalida/expirada o usuario inactivo.
- `404`: la alerta no existe (`"Alert not found"`).

## 3. Tiempo real

### Conexion

- **Transporte:** Socket.IO sobre WebSocket con fallback a long-polling.
- **Namespace:** `/realtime` sobre el origen del backend, por ejemplo `http://localhost:3001/realtime`.
- **Autenticacion obligatoria:** enviar el mismo JWT de la API REST en `auth.token` durante el handshake. Tambien se acepta `Authorization: Bearer <token>` en clientes que controlen headers.
- El gateway valida firma, expiracion, sesion persistida y usuario `ACTIVE`. Una conexion no autenticada se desconecta y no recibe datos operacionales.
- La perdida de conexion no invalida la aplicacion. Socket.IO reintenta automaticamente. En cada conexion inicial o reconexion el frontend invalida y vuelve a consultar maquinaria y alertas mediante REST.

### machine.status.changed

Publicado una vez que la transicion de estado actual e historial fue confirmada en base de datos.

```ts
interface MachineStatusChangedEvent {
  machineId: number;
  machineCode: string;
  siteId: number;
  status: MachineStatus;
  effectiveAt: string;
  stateRecordId: number;
}
```

### alert.created

Publicado cuando se persiste una alerta activa de prioridad alta para un periodo continuo de inactividad.

### alert.resolved

Publicado cuando una lectura operativa resuelve una alerta activa y persiste `resolvedDate`.

Ambos eventos de alerta usan:

```ts
interface AlertRealtimeEvent {
  alertId: number;
  machineId: number;
  machineCode: string;
  siteId: number;
  siteName: string;
  priority: string;
  status: AlertStatus;
  generationDate: string;
  resolvedDate: string | null;
  inactiveSince: string;
  inactiveDurationMinutes: number;
}
```

## 4. Modelos de datos compartidos

```ts
export enum MachineStatus {
  REGISTERED = 'REGISTERED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  POWERED_ON_NO_PRODUCTIVE_USE = 'POWERED_ON_NO_PRODUCTIVE_USE',
  UNDER_DOCUMENTED_MAINTENANCE = 'UNDER_DOCUMENTED_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
}

export type AlertPriority = 'HIGH' | string;
export type ReportType = 'DAILY';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  status: string;
}

export interface CurrentUser extends AuthUser {
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Site {
  id: number;
  name: string;
  location: string | null;
}

export interface Machine {
  id: number;
  siteId: number;
  code: string;
  type: string;
  currentStatus: MachineStatus;
  hourlyRate: string;
}

export interface MachineWithSite extends Machine {
  site: Site;
}

export interface MachineStatusResponse {
  machineId: number;
  code: string;
  currentStatus: MachineStatus;
  lastStateStartDate: string | null;
}

export interface SensorReading {
  id: number;
  machineId: number;
  timestamp: string;
  vibration: string;
  energyConsumption: string;
}

export interface MachineStateRecord {
  id: number;
  machineId: number;
  status: MachineStatus;
  startDate: string;
  endDate: string | null;
}

export interface MachineWithLatestState extends Machine {
  machineStateRecords: MachineStateRecord[];
}

export interface TelemetryCreateResponse {
  reading: SensorReading;
  machineState: MachineWithLatestState | null;
}

export interface Alert {
  id: number;
  machineId: number;
  priority: AlertPriority;
  status: AlertStatus;
  generationDate: string;
  resolvedDate: string | null;
}

export interface AlertWithMachine extends Alert {
  stateRecordId: number | null;
  inactiveSince: string;
  inactiveDurationMinutes: number;
  machine: Machine & { site: Site };
}

export interface DailyReport {
  reportId: number;
  machineId: number;
  machineCode: string;
  siteId: number;
  siteName: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  activeHours: number;
  inactiveHours: number;
  totalClassifiedHours: number;
  effectiveUsagePercentage: number | null;
  hourlyRate: number;
  inactivityCost: number;
  hasData: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

## 5. Flujos de uso tipicos

### Login

1. Enviar `POST /api/auth/login` con `email` y `password`.
2. Guardar `accessToken` de la respuesta exitosa.
3. Enviar el token en cada llamada protegida como `Authorization: Bearer <token>`.
4. Opcionalmente llamar `GET /api/auth/me` para hidratar el usuario actual.
5. Para cerrar sesion, llamar `POST /api/auth/logout` y eliminar el token del cliente.

### Registrar maquinaria

1. Autenticarse con `POST /api/auth/login`.
2. Enviar `POST /api/machines` con `siteId`, `code`, `type` y opcionalmente `hourlyRate`.
3. Si responde `201`, usar la maquina creada para actualizar la UI; esta respuesta no incluye `site`.
4. Si la pantalla necesita nombre de obra, llamar `GET /api/machines/:id` o refrescar `GET /api/machines`, porque esos endpoints si incluyen `site`.
5. Manejar `404` si la obra no existe y `409` si el codigo de maquina ya esta registrado.

### Ver estado

1. Autenticarse y cargar maquinaria con `GET /api/machines`.
2. Para el estado puntual de una maquina, llamar `GET /api/machines/:id/status`.
3. Mostrar `currentStatus` y, si existe, `lastStateStartDate`.
4. Para graficar lecturas recientes, llamar `GET /api/telemetry/machine/:machineId`; devuelve maximo 100 lecturas ordenadas de mas reciente a mas antigua.
5. Si el frontend simula telemetria, enviar `POST /api/telemetry` y usar `machineState.currentStatus` para refrescar el estado.

### Generar reporte diario

1. Autenticarse y seleccionar una maquina desde `GET /api/machines`.
2. Llamar `GET /api/reports/daily?machineId=<id>&date=<YYYY-MM-DD>`.
3. Mostrar `activeHours`, `inactiveHours`, `effectiveUsagePercentage`, `hourlyRate` e `inactivityCost`.
4. El endpoint hace `upsert` del reporte diario y del costo de inactividad; repetir la llamada para el mismo dia actualiza/reusa el registro.
5. El scheduler evalua cada minuto el cierre local configurado y genera el reporte de todas las maquinas. Los errores se registran por maquina sin detener el servidor.
6. `GET /api/reports/daily/generated` recupera los reportes ya persistidos para `/reports`.
7. No hay descarga PDF ni URL de archivo implementada para este flujo.

### Ver alertas

1. Autenticarse.
2. Llamar `GET /api/alerts/active` para el panel de alertas vigentes, o `GET /api/alerts` para historial completo.
3. Usar `machine.code`, `machine.type`, `priority`, `status` y `generationDate` para renderizar la lista.
4. Para detalle, llamar `GET /api/alerts/:id`.
5. Las alertas se generan indirectamente al procesar telemetria inactiva por mas de `ALERT_THRESHOLD_MINUTES` (default `30`); se resuelven automaticamente cuando una lectura vuelve a clasificar la maquina como `ACTIVE`.

## 6. Notas/Desviaciones

- `ContextMD.md` y los diagramas proponen usuarios/roles/permisos, pero el backend real no implementa endpoints de usuarios, roles ni RBAC. Solo valida JWT y estado activo del usuario.
- Los diagramas muestran registro conjunto de maquinaria, contrato y sensor. El backend real solo registra `Machine` con `hourlyRate` embebido; no existen modelos/endpoints de contratos ni sensores.
- `ContextMD.md` sugiere rutas `/api/machinery`; el backend real usa `/api/machines`.
- `ContextMD.md` sugiere `POST /api/telemetry/simulate` y `GET /api/telemetry?machineId=&from=&to=`; el backend real solo tiene `POST /api/telemetry` y `GET /api/telemetry/machine/:machineId`.
- El diagrama de monitoreo incluye `GET /dashboard`; no existe ese endpoint dedicado, pero el servicio realtime esta implementado mediante el gateway `/realtime` y la carga inicial usa endpoints REST existentes.
- Los diagramas de alertas incluyen incidentes y notificaciones; el backend real solo lista alertas y las crea/resuelve internamente al procesar telemetria. No existe endpoint para crear incidentes ni cambiar estado de alerta manualmente.
- El diagrama de reportes muestra `POST /reports`, PDF y storage con URL de descarga. El backend real implementa `GET /api/reports/daily` y devuelve metricas JSON, sin PDF ni `fileUrl` en la respuesta.
- La clasificacion implementa la regla sugerida: una lectura es operativa si `vibration >= VIBRATION_THRESHOLD` **o** `energyConsumption >= ENERGY_THRESHOLD`; solo permanece bajo umbral si ambos valores son inferiores.
- Existe `HttpExceptionFilter` con `{ statusCode, path, error, timestamp }`, pero no esta registrado; el formato real de error es el estandar de NestJS.
- Swagger declara `ApiOkResponse` para `POST /api/auth/login` y `POST /api/auth/logout`, pero al no usar `@HttpCode(200)`, Nest responde `201` en ejecucion real.
