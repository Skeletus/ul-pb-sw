# WorkMeter Backend Implementation Plan

## 1. Resumen del alcance del MVP

El backend implementara una API REST independiente para el Sprint 1 del Release 01 de WorkMeter. El alcance cubre autenticacion basica, registro de maquinaria, recepcion de telemetria simulada, clasificacion activa/inactiva, alertas visuales por inactividad prolongada, reporte diario y costo estimado por inactividad.

No se implementaran funcionalidades de Sprint 2, Sprint 3 o Sprint 4.

## 2. Historias HU01 a HU06 implementadas

- HU01: Iniciar sesion de forma segura.
- HU02: Registrar nueva maquinaria.
- HU03: Visualizar estado activo o inactivo de la maquinaria.
- HU04: Generar reporte diario del uso efectivo de maquinaria.
- HU05: Recibir alerta visual por inactividad prolongada.
- HU06: Visualizar costo estimado generado por tiempo de inactividad.

## 3. Historias fuera de alcance

- Recuperacion de contrasena.
- RBAC completo.
- Roles y permisos avanzados.
- Registro completo de contratos de alquiler.
- Asociacion formal de sensores a maquinaria.
- Incidencias operativas.
- Notificaciones reales por correo u otros canales.
- Exportacion PDF.
- Auditoria.
- Mantenimiento documental.
- Reporte final de optimizacion.
- Indicadores de ahorro proyectado.
- Tendencias de uso.
- Recomendaciones automaticas.

## 4. Entidades que se implementaran

- User.
- Session.
- Site.
- Machine.
- MachineStatus.
- SensorReading.
- MachineStateRecord.
- UsageClassifier como servicio de dominio.
- Alert.
- DailyReport, representado con la tabla reports usando type = DAILY.
- InactivityCost.

## 5. Entidades que quedaran pendientes

- Role, Permission y role_permission: fuera por no implementar RBAC completo.
- AuditLog: fuera por prohibicion explicita de auditoria.
- RentalContract: fuera por no implementar contratos completos en Sprint 1.
- Sensor: fuera por no implementar asociacion formal de sensores a maquinaria.
- AlertConfiguration editable: fuera por no implementar configuracion editable.
- Incident: fuera por no implementar incidencias operativas.
- Notification: fuera por no implementar notificaciones reales.
- MaintenanceHistory: fuera por no implementar mantenimiento.
- FinalOptimizationReport, SavingsIndicator, UsageTrend y Recommendation: fuera por Sprint 2+.

## 6. Endpoints REST a construir

- POST /auth/login
- POST /auth/logout
- GET /auth/me
- POST /machines
- GET /machines
- GET /machines/:id
- GET /machines/:id/status
- POST /telemetry
- GET /telemetry/machine/:machineId
- GET /alerts/active
- GET /alerts
- GET /alerts/:id
- GET /reports/daily?machineId=&date=
- GET /reports/daily/generated
- Socket.IO `/realtime`: `machine.status.changed`, `alert.created`, `alert.resolved`

## 7. Modulos NestJS a crear

- AuthModule.
- MachineryModule.
- TelemetryModule.
- MonitoringModule.
- AlertsModule.
- ReportsModule.
- TelemetrySimulator.
- RealtimeModule.
- ScheduleModule para alertas y reportes automaticos.
- PrismaModule.
- CommonModule implicito mediante filtros, guards, interceptors y utils.

## 8. Tablas Prisma a crear

- users.
- sessions.
- sites.
- machines.
- sensor_readings.
- machine_state_records.
- alerts.
- reports.
- inactivity_costs.

## 9. Reglas de negocio que seran implementadas

- RB01: Una maquina se clasifica como inactiva si vibracion o consumo energetico estan bajo umbral operativo por mas de 5 minutos.
- RB02: Una alerta de alta prioridad se genera cuando una maquina permanece inactiva por mas de 30 minutos.
- RB03: El costo por inactividad se calcula como horas inactivas acumuladas por tarifa configurada.
- Si la maquina vuelve a estar activa, las alertas activas de inactividad de esa maquina se marcaran como resueltas.
- No se crearan alertas duplicadas activas para la misma maquina durante el mismo periodo de inactividad.
- El estado inicial de una maquina sera REGISTERED.

## 10. Decisiones tecnicas asumidas

- El ERD usa ids INT; el backend usara ids numericos autoincrementales en Prisma y validaciones numericas positivas.
- El ERD modela sensor_readings con sensor_id obligatorio, pero Sprint 1 excluye asociacion formal de sensores. Para cumplir el endpoint POST /telemetry con machineId, sensor_readings tendra machine_id directo.
- El ERD ubica hourly_rate en rental_contracts, pero Sprint 1 excluye contratos completos. Para HU06 se agregara hourly_rate a machines como tarifa configurada minima del MVP.
- Se implementara Session porque existe en los diagramas y permite logout basico sin Redis ni blacklist externa. Logout marcara expiration_date con la fecha actual para la sesion asociada al token.
- Los umbrales operativos seran constantes configurables por variables de entorno: vibration threshold, energy threshold, inactivity threshold de 5 minutos y alert threshold de 30 minutos.
- La jornada diaria se configura globalmente con `WORKDAY_START`, `WORKDAY_END` y `WORK_TIMEZONE`; el valor predeterminado es 08:00-17:00 en `America/Lima`.
- Las lecturas fuera de orden se rechazan para mantener transiciones deterministas. Cada alerta se vincula de forma unica al intervalo continuo de inactividad que la origino.
- No se agregara Redis porque no se usara cache, sesiones distribuidas ni blacklist de tokens en el MVP.
- Swagger se expondra en /api/docs y la API usara prefijo global /api.
