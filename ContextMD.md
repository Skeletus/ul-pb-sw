# ContextMD - WorkMeter

## 1. Propósito de este archivo

Este archivo sirve como contexto maestro para cualquier agente IA, desarrollador o herramienta automática que necesite entender, mantener, extender o implementar el proyecto **WorkMeter**.

WorkMeter es una plataforma web para el monitoreo de maquinaria alquilada en obras de construcción. Su objetivo es ayudar a constructoras a identificar si una maquinaria está siendo usada de forma efectiva o si permanece encendida sin generar trabajo productivo, permitiendo reducir costos innecesarios, mejorar la eficiencia operativa y tomar decisiones basadas en datos.

Este contexto debe usarse como fuente de verdad para interpretar los diagramas UML, diseñar el MVP, construir el frontend, backend, landing page, base de datos, simulación de sensores y lógica de negocio.

---

## 2. Nombre del producto

**WorkMeter**

Producto desarrollado por la startup ficticia **Energy-Saver**.

Nombre conceptual: **Sistema de Monitoreo de Uso Efectivo de Maquinaria Alquilada para el Sector Construcción basado en Sensores**.

---

## 3. Problema que resuelve

En el sector construcción, muchas empresas alquilan maquinaria pesada por día, semana o mes. Sin embargo, no siempre tienen visibilidad clara sobre el uso real de esos equipos.

El problema principal es que una máquina puede estar:

- Encendida, pero sin producir.
- Inactiva durante largos periodos.
- Usándose por menos tiempo del esperado.
- Generando costos de alquiler sin aportar productividad.
- Produciendo consumo de energía o combustible innecesario.
- Permaneciendo en obra aunque financieramente convendría retirarla, renovarla o reasignarla.

Sin un sistema de monitoreo, los supervisores y administradores dependen de reportes manuales, observación directa o estimaciones poco confiables.

WorkMeter busca resolver esa falta de visibilidad mediante telemetría, análisis de uso efectivo, alertas, reportes e indicadores de costo.

---

## 4. Solución propuesta

WorkMeter es una plataforma web que recibe datos de sensores instalados en maquinaria alquilada. Los sensores capturan principalmente:

- Vibración.
- Consumo energético.
- Estado de conexión.
- Fecha y hora de cada lectura.

Con esos datos, el sistema puede determinar si una maquinaria está:

- Activa.
- Inactiva.
- Encendida sin uso productivo.
- Sin conexión.
- Dada de baja o fuera del monitoreo.

La plataforma permite visualizar la información en dashboards, registrar maquinaria y contratos, asociar sensores, generar alertas por inactividad, calcular costos desperdiciados y generar reportes de uso y optimización.

---

## 5. Objetivo general

Reducir los costos innecesarios asociados al alquiler de maquinaria pesada en obras de construcción mediante el monitoreo del uso efectivo de equipos, la detección de inactividad y la generación de reportes de costos y eficiencia.

---

## 6. Objetivos específicos

- Registrar maquinaria pesada alquilada.
- Registrar contratos de alquiler asociados a cada máquina.
- Asociar sensores físicos o simulados a las máquinas.
- Recibir datos de telemetría de sensores.
- Clasificar el estado operativo de cada máquina.
- Visualizar el estado activo o inactivo en tiempo real.
- Generar alertas por inactividad prolongada.
- Registrar incidencias operativas.
- Calcular el costo estimado por tiempo inactivo.
- Generar reportes diarios, históricos y finales.
- Identificar maquinaria con baja utilización.
- Comparar rendimiento y costos entre máquinas.
- Recomendar continuidad, retiro, renovación o reasignación de maquinaria.
- Auditar acciones críticas realizadas por usuarios.

---

## 7. Alcance del sistema

### Incluido en el alcance

El sistema incluye:

- Landing page pública.
- Aplicación web autenticada.
- Backend API.
- Base de datos.
- Simulación de sensores IoT.
- Gestión de usuarios, roles y permisos.
- Gestión de maquinaria.
- Gestión de contratos de alquiler.
- Asociación de sensores a maquinaria.
- Recepción o simulación de telemetría.
- Monitoreo en tiempo real o casi real.
- Dashboard operativo.
- Alertas por inactividad.
- Incidencias operativas.
- Reportes de uso.
- Reportes de costos.
- Exportación de reportes.
- Indicadores de eficiencia.
- Logs de auditoría.
- Recomendaciones de optimización.

### Fuera del alcance

No se debe implementar como parte del MVP:

- Pagos reales a proveedores.
- Facturación real.
- Integración bancaria.
- GPS fuera de obra.
- Mantenimiento físico real de maquinaria.
- Control remoto de maquinaria.
- Integración con sensores industriales reales obligatoria.
- Aplicación móvil nativa.
- Inteligencia artificial avanzada obligatoria.
- Predicción compleja con machine learning.
- Gestión completa de recursos humanos de obra.

El mantenimiento solo debe considerarse como **registro documental**, no como ejecución técnica física.

---

## 8. Usuarios y actores

### 8.1 Supervisor de Obra

Usuario operativo que necesita visibilidad rápida del estado de las máquinas en campo.

Responsabilidades:

- Iniciar sesión.
- Ver dashboard.
- Ver estado activo o inactivo de maquinaria.
- Consultar consumo energético.
- Recibir alertas.
- Ver detalle de alertas.
- Registrar incidencias.
- Filtrar maquinaria por obra o proyecto.
- Priorizar atención en máquinas críticas.

Necesidades:

- Información en tiempo real.
- Alertas claras.
- Panel visual simple.
- Datos confiables.
- Menor dependencia de inspecciones manuales.

---

### 8.2 Administrador de Proyectos

Usuario de gestión que analiza costos, contratos, eficiencia y reportes.

Responsabilidades:

- Registrar maquinaria.
- Registrar contratos de alquiler.
- Asociar sensores.
- Ver costos por inactividad.
- Comparar horas activas e inactivas.
- Generar reportes.
- Exportar PDF o Excel.
- Identificar baja utilización.
- Comparar costos operativos.
- Configurar parámetros de alerta.
- Gestionar roles y permisos.
- Auditar acciones.
- Evaluar continuidad del alquiler.

Necesidades:

- Reportes confiables.
- Datos históricos.
- Indicadores financieros.
- Evidencia para justificar decisiones.
- Control sobre contratos y costos.

---

### 8.3 Usuario autenticado

Actor general para funciones comunes:

- Iniciar sesión.
- Cerrar sesión.
- Recuperar contraseña.
- Editar perfil.
- Cambiar contraseña.

---

### 8.4 Sensor IoT

Actor externo no humano. Puede ser real o simulado en el MVP.

Responsabilidades:

- Enviar lecturas de vibración.
- Enviar consumo energético.
- Informar estado de conexión.
- Asociarse a una maquinaria.

En el MVP, el sensor puede ser simulado mediante endpoints, seeders, jobs automáticos o datos generados desde backend.

---

### 8.5 Servicio de Notificaciones

Servicio encargado de informar alertas críticas.

Puede representarse como:

- Módulo interno del backend.
- Servicio de correo.
- Servicio de notificaciones visuales.
- Simulación dentro del dashboard.

En MVP basta con notificaciones visuales dentro del sistema.

---

### 8.6 Servicio de Exportación de Reportes

Componente encargado de generar archivos descargables.

Puede producir:

- PDF.
- Excel.
- CSV.
- Archivo compatible con BI.

En MVP basta con PDF simple o CSV/Excel básico.

---

### 8.7 Dirección de la Constructora

Actor destinatario de reportes finales de optimización.

No necesariamente interactúa directamente con el sistema en el MVP, pero puede aparecer como receptor del reporte final.

---

## 9. Estructura recomendada del proyecto

El proyecto puede organizarse en tres carpetas principales:

```text
workmeter/
├── landing-page/
├── frontend/
└── backend/
```

### 9.1 landing-page

Contiene la página pública de presentación del producto.

Debe incluir:

- Página de inicio.
- Explicación del problema.
- Propuesta de valor.
- Beneficios.
- Sección de funcionalidades.
- Sección de ODS 12.
- Sección de cómo funciona.
- Botón para ingresar al sistema.
- Diseño moderno y profesional.

No requiere autenticación.

---

### 9.2 frontend

Contiene la aplicación principal del usuario autenticado.

Debe incluir pantallas como:

- Login.
- Recuperar contraseña.
- Dashboard.
- Gestión de maquinaria.
- Registro de maquinaria.
- Detalle de maquinaria.
- Contratos de alquiler.
- Sensores.
- Telemetría.
- Alertas.
- Incidencias.
- Reportes.
- Costos.
- Usuarios y roles.
- Auditoría.
- Configuración.

El frontend consume la API del backend.

---

### 9.3 backend

Contiene la API, lógica de negocio, base de datos, validaciones y simulación de sensores.

Debe incluir módulos como:

- Autenticación.
- Usuarios.
- Roles y permisos.
- Maquinaria.
- Obras.
- Contratos.
- Sensores.
- Telemetría.
- Monitoreo.
- Alertas.
- Incidencias.
- Reportes.
- Costos.
- Optimización.
- Auditoría.
- Seeders o datos de prueba.
- Simulador de telemetría.

---

## 10. Releases y sprints

El proyecto original se organiza en dos releases de 8 semanas cada uno, con 4 sprints en total.

---

## 11. MVP recomendado

Para un MVP académico y funcional, se recomienda implementar principalmente **Release 1**, con prioridad en Sprint 1 y algunas funciones de Sprint 2.

### MVP obligatorio

Debe cubrir como mínimo:

- Landing page.
- Login básico.
- Dashboard principal.
- Registro de maquinaria.
- Registro de contrato de alquiler.
- Asociación de sensor simulado.
- Simulación de telemetría.
- Clasificación de maquinaria activa/inactiva.
- Visualización de estado en dashboard.
- Cálculo de horas activas e inactivas.
- Alerta visual por inactividad prolongada.
- Cálculo de costo por inactividad.
- Reporte diario básico.
- Registro de incidencia asociada a una alerta.

### MVP opcional pero recomendable

- Recuperación de contraseña.
- Exportación PDF.
- Consumo energético acumulado.
- Filtros por obra.
- Comparación de máquinas.
- Historial de reportes.
- Logs de auditoría.
- Gestión de roles básica.

---

## 12. Sprint 1: Construcción del MVP

Objetivo: construir el núcleo mínimo funcional de WorkMeter.

Historias incluidas:

### HU01 - Iniciar sesión de manera segura

Como supervisor de obra, quiero ingresar mis credenciales para acceder al panel de WorkMeter.

Criterios:

- Con credenciales correctas, el sistema autentica y redirige al dashboard.
- Con credenciales incorrectas, deniega acceso y muestra error.

---

### HU02 - Registrar una nueva máquina

Como administrador de proyectos, quiero dar de alta una nueva maquinaria pesada para habilitar su monitoreo.

Criterios:

- Si completa datos obligatorios, el sistema guarda la máquina.
- Si faltan campos, el sistema impide el registro.

---

### HU03 - Visualizar estado activo o inactivo

Como supervisor de obra, quiero ver si una máquina está activa o inactiva para detectar tiempos muertos.

Criterios:

- El sistema recibe telemetría.
- Si los valores están bajo el umbral por más de 5 minutos, marca la máquina como inactiva.
- El dashboard actualiza el estado visual.

---

### HU04 - Generar reporte diario

Como administrador de proyectos, quiero que el sistema consolide horas de uso diario para evaluar eficiencia.

Criterios:

- Al cerrar el día o seleccionar periodo, el sistema procesa estados acumulados.
- Calcula uso efectivo.
- Muestra resumen en reportes diarios.

---

### HU05 - Recibir alerta visual por inactividad prolongada

Como supervisor de obra, quiero recibir una alerta visual cuando una máquina está detenida demasiado tiempo.

Criterios:

- Si una máquina está inactiva por más de 30 minutos, se genera alerta de alta prioridad.
- La alerta aparece en el panel.

---

### HU06 - Visualizar costo estimado por inactividad

Como administrador de proyectos, quiero ver la pérdida monetaria generada por inactividad.

Criterios:

- El sistema multiplica horas inactivas por la tarifa del contrato.
- Muestra el costo desperdiciado en moneda local.

---

## 13. Sprint 2: Estabilización y base funcional completa

Objetivo: completar funcionalidades base para que el MVP sea más sólido.

Historias incluidas:

### HU07 - Recuperar contraseña y cerrar sesión

- Recuperación mediante correo registrado.
- Cierre de sesión seguro.

### HU08 - Registrar contrato de alquiler y asociar sensores

- Registrar costo y duración del contrato.
- Asociar sensor físico o simulado a una máquina.
- Validar conexión del sensor.

### HU09 - Consultar consumo energético

- Mostrar consumo acumulado por periodo seleccionado.

### HU10 - Comparar horas activas vs. inactivas y descargar reporte PDF

- Mostrar gráfico comparativo.
- Permitir descargar reporte.

### HU11 - Ver detalle de alerta y registrar incidencia

- Abrir detalle de alerta.
- Registrar causa de la inactividad.
- Asociar incidencia a alerta y maquinaria.

### HU12 - Identificar maquinaria con baja utilización y comparar costos

- Calcular porcentaje de uso efectivo.
- Resaltar máquinas con baja utilización.
- Comparar costos operativos entre máquinas.

---

## 14. Release 2: Funcionalidades avanzadas

Estas funciones pueden quedar para una segunda etapa.

### Sprint 3

- Editar perfil.
- Cambiar contraseña.
- Gestionar roles y permisos.
- Modificar información técnica de equipos.
- Dar de baja maquinaria.
- Filtrar por proyecto u obra.
- Dashboard dinámico con múltiples máquinas.
- Historial de reportes.
- Configurar parámetros de alerta.
- Notificaciones automáticas.
- Indicadores de ahorro proyectado.

### Sprint 4

- Registrar historial de acciones.
- Registrar historial de mantenimiento documental.
- Comparar rendimiento entre máquinas.
- Analizar tendencias de uso.
- Priorizar incidencias críticas.
- Generar reporte final de optimización.

---

## 15. Reglas de negocio obligatorias

Estas reglas deben implementarse o representarse en código, diagramas, pruebas y documentación.

### RB01 - Clasificación de inactividad

Una maquinaria se considera inactiva si los valores de vibración o consumo energético están por debajo del umbral operativo durante más de 5 minutos.

### RB02 - Alerta de alta prioridad

Una alerta de alta prioridad se genera cuando una maquinaria permanece inactiva durante más de 30 minutos o supera el umbral configurado.

### RB03 - Costo por inactividad

El costo por inactividad se calcula así:

```text
costo_inactividad = horas_inactivas_acumuladas * tarifa_configurada
```

La tarifa puede venir del contrato de alquiler.

### RB04 - Baja utilización

Una máquina se considera de baja utilización si su porcentaje de uso efectivo está por debajo del umbral definido por el administrador.

### RB05 - Reportes filtrables

Los reportes deben poder filtrarse por:

- Obra.
- Maquinaria.
- Rango de fechas.
- Estado.
- Tipo de reporte.

### RB06 - Control de acceso

Los usuarios solo pueden acceder a funciones permitidas según su rol.

### RB07 - Auditoría

Toda acción crítica debe registrarse:

- Crear maquinaria.
- Editar maquinaria.
- Dar de baja maquinaria.
- Cambiar roles.
- Registrar contrato.
- Asociar sensor.
- Configurar alertas.
- Generar reporte final.

### RB08 - Reporte final

El reporte final debe consolidar:

- Horas activas.
- Horas inactivas.
- Costos desperdiciados.
- Ahorros proyectados.
- Incidencias resueltas.
- Recomendaciones.
- Conclusiones.

---

## 16. Estados principales del dominio

### 16.1 Estados de maquinaria

- Registrada.
- Activa.
- Inactiva.
- Encendida sin uso productivo.
- En mantenimiento documental.
- Dada de baja.

### 16.2 Estados de contrato

- Vigente.
- Vencido.
- Cancelado.
- Renovado.

### 16.3 Estados de sensor

- Disponible.
- Asociado.
- Activo.
- Sin conexión.
- En error.

### 16.4 Estados de alerta

- Nueva.
- En revisión.
- Atendida.
- Cerrada.

### 16.5 Estados de incidencia

- Registrada.
- Priorizada.
- En atención.
- Resuelta.
- Cerrada.

### 16.6 Estados de reporte

- Generado.
- Exportado.
- Descargado.
- Archivado.

---

## 17. Entidades principales

### Usuario

Representa a una persona que accede a la plataforma.

Atributos sugeridos:

- id
- nombre
- apellido
- correo
- passwordHash
- estado
- rolId
- fechaCreacion
- ultimoAcceso

Relaciones:

- Pertenece a un rol.
- Puede tener sesiones.
- Puede generar logs de auditoría.
- Puede registrar incidencias.
- Puede generar reportes.

---

### Rol

Define el nivel de acceso de un usuario.

Roles sugeridos:

- Supervisor de Obra.
- Administrador de Proyectos.
- Administrador del Sistema.

Atributos:

- id
- nombre
- descripcion

---

### Permiso

Representa una acción autorizada.

Atributos:

- id
- codigo
- descripcion

Ejemplos:

- maquinaria.crear
- maquinaria.editar
- reportes.generar
- alertas.configurar
- usuarios.gestionar

---

### Obra

Representa una obra o proyecto de construcción.

Atributos:

- id
- nombre
- ubicacion
- estado
- fechaInicio
- fechaFin

Relaciones:

- Tiene muchas maquinarias.
- Tiene reportes.
- Puede tener usuarios asignados.

---

### Maquinaria

Representa una máquina pesada alquilada.

Atributos:

- id
- codigoInterno
- nombre
- tipo
- marca
- modelo
- numeroSerie
- estadoRegistro
- estadoOperativoActual
- fechaAlta
- fechaBaja
- obraId

Relaciones:

- Pertenece a una obra.
- Tiene contratos.
- Tiene sensores.
- Tiene lecturas.
- Tiene estados.
- Tiene alertas.
- Tiene incidencias.
- Tiene reportes.
- Tiene costos de inactividad.
- Tiene historial de mantenimiento.

---

### ContratoAlquiler

Representa los datos contractuales de una maquinaria.

Atributos:

- id
- maquinariaId
- proveedor
- fechaInicio
- fechaFin
- tarifaHora
- tarifaDia
- tarifaMensual
- moneda
- estadoContrato
- condiciones

Relaciones:

- Pertenece a una maquinaria.
- Se usa para calcular costos.

---

### Sensor

Representa un dispositivo físico o simulado asociado a una máquina.

Atributos:

- id
- codigoSensor
- tipoSensor
- estadoConexion
- fechaInstalacion
- maquinariaId

Tipos:

- Vibración.
- Consumo energético.
- Mixto.

Relaciones:

- Pertenece a una maquinaria.
- Genera lecturas.

---

### LecturaSensor

Representa una lectura enviada por un sensor.

Atributos:

- id
- sensorId
- maquinariaId
- timestamp
- valorVibracion
- consumoEnergetico
- estadoConexion

Relaciones:

- Pertenece a un sensor.
- Pertenece a una maquinaria.
- Alimenta el clasificador de estado.

---

### EstadoMaquinaria

Representa un intervalo de estado calculado.

Atributos:

- id
- maquinariaId
- tipoEstado
- fechaInicio
- fechaFin
- duracionMinutos

Tipos:

- Activa.
- Inactiva.
- Encendida sin uso productivo.
- Sin conexión.

---

### Alerta

Representa una advertencia generada por el sistema.

Atributos:

- id
- maquinariaId
- tipo
- mensaje
- severidad
- fechaInicio
- fechaFin
- estado

Relaciones:

- Pertenece a una maquinaria.
- Puede tener incidencias.
- Puede generar notificaciones.

---

### Incidencia

Representa una explicación o causa registrada ante una alerta.

Atributos:

- id
- alertaId
- maquinariaId
- usuarioId
- causa
- descripcion
- severidad
- estado
- fechaRegistro

Relaciones:

- Se asocia a una alerta.
- Se asocia a una maquinaria.
- Es registrada por un usuario.

---

### Notificacion

Representa un aviso generado por una alerta.

Atributos:

- id
- alertaId
- usuarioId
- canal
- destinatario
- mensaje
- estadoEnvio
- fechaEnvio

---

### Reporte

Representa un documento o resumen generado por el sistema.

Atributos:

- id
- tipoReporte
- fechaGeneracion
- periodoInicio
- periodoFin
- formato
- urlArchivo
- usuarioId
- obraId
- maquinariaId

Tipos:

- Diario.
- Histórico.
- Comparativo.
- Final de optimización.

---

### CostoInactividad

Representa el costo desperdiciado por inactividad.

Atributos:

- id
- maquinariaId
- contratoId
- horasInactivas
- tarifaAplicada
- montoCalculado
- moneda
- periodoInicio
- periodoFin

---

### IndicadorAhorro

Representa ahorro real o proyectado.

Atributos:

- id
- maquinariaId
- ahorroProyectado
- porcentajeMejora
- periodo
- fechaCalculo

---

### TendenciaUso

Representa evolución de uso en el tiempo.

Atributos:

- id
- maquinariaId
- periodo
- valorUsoEfectivo
- variacion

---

### Recomendacion

Representa una sugerencia de decisión.

Atributos:

- id
- maquinariaId
- tipo
- descripcion
- justificacion
- prioridad
- fechaGeneracion

Tipos:

- Continuar alquiler.
- Retirar maquinaria.
- Renovar contrato.
- Reasignar maquinaria.
- Revisar operación.

---

### HistorialMantenimiento

Registro documental de mantenimiento.

Atributos:

- id
- maquinariaId
- fecha
- tipo
- descripcion
- responsable

---

### LogAuditoria

Registro de acciones críticas.

Atributos:

- id
- usuarioId
- accion
- entidadAfectada
- entidadId
- fechaHora
- detalle
- ip

---

## 18. Modelo de base de datos sugerido

Tablas mínimas:

- usuarios
- roles
- permisos
- rol_permiso
- sesiones
- logs_auditoria
- obras
- maquinaria
- contratos_alquiler
- sensores
- lecturas_sensor
- estados_maquinaria
- configuraciones_alerta
- alertas
- incidencias
- notificaciones
- reportes
- costos_inactividad
- indicadores_ahorro
- tendencias_uso
- recomendaciones
- historiales_mantenimiento

Relaciones clave:

- roles 1:N usuarios.
- roles N:M permisos mediante rol_permiso.
- usuarios 1:N sesiones.
- usuarios 1:N logs_auditoria.
- obras 1:N maquinaria.
- maquinaria 1:N contratos_alquiler.
- maquinaria 1:N sensores.
- sensores 1:N lecturas_sensor.
- maquinaria 1:N lecturas_sensor.
- maquinaria 1:N estados_maquinaria.
- maquinaria 1:N alertas.
- alertas 1:N incidencias.
- alertas 1:N notificaciones.
- maquinaria 1:N reportes.
- obras 1:N reportes.
- reportes 1:N costos_inactividad.
- maquinaria 1:N indicadores_ahorro.
- maquinaria 1:N tendencias_uso.
- maquinaria 1:N recomendaciones.
- maquinaria 1:N historiales_mantenimiento.

---

## 19. Bounded contexts DDD

### 19.1 Identidad y Acceso

Responsable de:

- Usuarios.
- Roles.
- Permisos.
- Sesiones.
- Recuperación de contraseña.
- Auditoría de acceso.

Entidades:

- Usuario.
- Rol.
- Permiso.
- Sesion.
- LogAuditoria.

---

### 19.2 Gestión de Maquinaria y Contratos

Responsable de:

- Obras.
- Maquinaria.
- Contratos.
- Sensores asociados.
- Historial de mantenimiento.

Entidades:

- Obra.
- Maquinaria.
- ContratoAlquiler.
- Sensor.
- HistorialMantenimiento.

---

### 19.3 Telemetría y Monitoreo

Responsable de:

- Recepción de lecturas.
- Clasificación activo/inactivo.
- Indicadores de uso.
- Dashboard en tiempo real.

Entidades:

- LecturaSensor.
- EstadoMaquinaria.
- ClasificadorUso.
- IndicadorUso.
- Dashboard.

---

### 19.4 Alertas e Incidencias

Responsable de:

- Configuración de alertas.
- Generación de alertas.
- Notificaciones.
- Registro de incidencias.
- Priorización.

Entidades:

- ConfiguracionAlerta.
- Alerta.
- Incidencia.
- Notificacion.
- PriorizadorIncidencias.

---

### 19.5 Reportes, Costos y Optimización

Responsable de:

- Reportes.
- Exportación.
- Cálculo de costos.
- Indicadores de ahorro.
- Tendencias.
- Recomendaciones.

Entidades:

- Reporte.
- ReporteDiario.
- ReporteFinalOptimizacion.
- CostoInactividad.
- IndicadorAhorro.
- TendenciaUso.
- Recomendacion.

---

## 20. Módulos funcionales del backend

### AuthModule

Funciones:

- Login.
- Logout.
- Recuperar contraseña.
- Validar token.
- Cambiar contraseña.

### UsersModule

Funciones:

- CRUD de usuarios.
- Asignación de roles.
- Consulta de permisos.

### MachineryModule

Funciones:

- Registrar maquinaria.
- Editar maquinaria.
- Dar de baja maquinaria.
- Listar maquinaria.
- Filtrar por obra.
- Consultar detalle.

### ContractsModule

Funciones:

- Registrar contrato.
- Editar contrato.
- Consultar contrato vigente.
- Validar vigencia.
- Obtener tarifa aplicable.

### SensorsModule

Funciones:

- Registrar sensor.
- Asociar sensor a maquinaria.
- Validar conexión.
- Consultar estado del sensor.

### TelemetryModule

Funciones:

- Recibir lecturas.
- Simular lecturas.
- Guardar telemetría.
- Consultar histórico.

### MonitoringModule

Funciones:

- Clasificar estado de maquinaria.
- Calcular horas activas.
- Calcular horas inactivas.
- Actualizar dashboard.

### AlertsModule

Funciones:

- Evaluar reglas de alerta.
- Generar alerta.
- Cambiar estado de alerta.
- Configurar umbrales.

### IncidentsModule

Funciones:

- Registrar incidencia.
- Asociar incidencia a alerta.
- Priorizar incidencias.
- Cerrar incidencias.

### ReportsModule

Funciones:

- Generar reporte diario.
- Generar reporte histórico.
- Generar reporte comparativo.
- Exportar PDF/Excel/CSV.
- Consultar historial.

### CostsModule

Funciones:

- Calcular costo por inactividad.
- Comparar costos operativos.
- Calcular costo acumulado.

### OptimizationModule

Funciones:

- Identificar baja utilización.
- Calcular ahorro proyectado.
- Analizar tendencias.
- Generar recomendaciones.

### AuditModule

Funciones:

- Registrar logs.
- Consultar acciones críticas.

---

## 21. Endpoints REST sugeridos

Los nombres pueden adaptarse al framework, pero el comportamiento debe mantenerse.

### Autenticación

```http
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Usuarios y roles

```http
GET    /api/users
POST   /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}

GET    /api/roles
POST   /api/roles
PUT    /api/roles/{id}
```

### Obras

```http
GET    /api/works
POST   /api/works
GET    /api/works/{id}
PUT    /api/works/{id}
DELETE /api/works/{id}
```

### Maquinaria

```http
GET    /api/machinery
POST   /api/machinery
GET    /api/machinery/{id}
PUT    /api/machinery/{id}
DELETE /api/machinery/{id}
GET    /api/machinery/{id}/status
GET    /api/machinery/{id}/telemetry
GET    /api/machinery/{id}/costs
```

### Contratos

```http
GET    /api/contracts
POST   /api/contracts
GET    /api/contracts/{id}
PUT    /api/contracts/{id}
GET    /api/machinery/{id}/contracts
```

### Sensores

```http
GET    /api/sensors
POST   /api/sensors
GET    /api/sensors/{id}
PUT    /api/sensors/{id}
POST   /api/sensors/{id}/associate
POST   /api/sensors/{id}/validate-connection
```

### Telemetría

```http
POST   /api/telemetry
POST   /api/telemetry/simulate
GET    /api/telemetry?machineId=&from=&to=
```

### Monitoreo

```http
GET    /api/monitoring/dashboard
GET    /api/monitoring/machines/status
GET    /api/monitoring/machines/{id}/usage
```

### Alertas

```http
GET    /api/alerts
GET    /api/alerts/{id}
PUT    /api/alerts/{id}/status
POST   /api/alerts/configuration
GET    /api/alerts/configuration
```

### Incidencias

```http
GET    /api/incidents
POST   /api/incidents
GET    /api/incidents/{id}
PUT    /api/incidents/{id}
PUT    /api/incidents/{id}/resolve
```

### Reportes

```http
GET    /api/reports
POST   /api/reports/daily
POST   /api/reports/historical
POST   /api/reports/final-optimization
GET    /api/reports/{id}
GET    /api/reports/{id}/download
```

### Costos y optimización

```http
GET    /api/costs/inactivity
GET    /api/costs/compare
GET    /api/optimization/low-utilization
GET    /api/optimization/savings
GET    /api/optimization/recommendations
```

### Auditoría

```http
GET    /api/audit/logs
```

---

## 22. Pantallas sugeridas del frontend

### Landing Page

Secciones:

- Hero con nombre WorkMeter.
- Problema: maquinaria alquilada sin uso efectivo.
- Solución: monitoreo con sensores.
- Beneficios.
- Cómo funciona.
- Funcionalidades.
- Impacto en costos.
- ODS 12.
- Botón de ingreso al sistema.

---

### Login

Elementos:

- Correo.
- Contraseña.
- Botón iniciar sesión.
- Link recuperar contraseña.
- Mensajes de error.

---

### Dashboard

Indicadores:

- Uso efectivo.
- Horas inactivas.
- Costo desperdiciado.
- Máquinas activas.
- Alertas recientes.
- Gráfico horas activas vs inactivas.
- Tabla de monitoreo en tiempo real.
- Estado por máquina.
- Eficiencia general.

---

### Gestión de maquinaria

Funciones:

- Listar máquinas.
- Crear máquina.
- Editar máquina.
- Dar de baja.
- Ver detalle.
- Filtrar por obra.
- Ver estado actual.

---

### Detalle de maquinaria

Debe mostrar:

- Datos técnicos.
- Contrato vigente.
- Sensor asociado.
- Estado actual.
- Lecturas recientes.
- Consumo energético.
- Alertas.
- Incidencias.
- Costos.

---

### Contratos

Funciones:

- Registrar contrato.
- Asociar contrato a maquinaria.
- Ver tarifa.
- Ver vigencia.
- Ver proveedor.

---

### Sensores

Funciones:

- Registrar sensor.
- Asociar sensor.
- Validar conexión.
- Ver estado.
- Simular lectura.

---

### Alertas

Funciones:

- Listar alertas.
- Ver detalle.
- Cambiar estado.
- Registrar incidencia.
- Filtrar por severidad.

---

### Incidencias

Funciones:

- Listar incidencias.
- Crear incidencia.
- Asociar alerta.
- Priorizar.
- Resolver.
- Cerrar.

---

### Reportes

Funciones:

- Generar reporte diario.
- Generar reporte histórico.
- Comparar horas activas e inactivas.
- Exportar PDF/Excel/CSV.
- Ver historial.
- Filtrar por fechas.

---

### Costos y optimización

Funciones:

- Ver costo por inactividad.
- Comparar costos operativos.
- Ver máquinas con baja utilización.
- Ver ahorro proyectado.
- Ver recomendaciones.

---

### Usuarios y roles

Funciones:

- Listar usuarios.
- Crear usuario.
- Asignar rol.
- Ver permisos.

---

### Auditoría

Funciones:

- Ver logs.
- Filtrar por usuario.
- Filtrar por acción.
- Filtrar por fecha.

---

## 23. Simulación de sensores para el MVP

No es obligatorio usar sensores reales. Para el MVP, se deben simular lecturas.

### Datos de simulación

Cada lectura puede tener:

```json
{
  "machineId": "MACH-001",
  "sensorId": "SEN-001",
  "timestamp": "2026-07-01T08:00:00",
  "vibration": 0.75,
  "energyConsumption": 12.4,
  "connectionStatus": "ACTIVE"
}
```

### Reglas sugeridas

- Si `vibration >= 0.5` o `energyConsumption >= 5`, la máquina está activa.
- Si `vibration < 0.5` y `energyConsumption < 5` por más de 5 minutos, está inactiva.
- Si está inactiva por más de 30 minutos, generar alerta.
- Si no llegan lecturas recientes, marcar sensor como sin conexión.

Estos valores pueden configurarse.

---

## 24. Datos iniciales recomendados

Para demo, crear seeders con:

### Usuarios

- admin@workmeter.com / Administrador de Proyectos.
- supervisor@workmeter.com / Supervisor de Obra.

### Obras

- Obra Residencial Los Olivos.
- Centro Comercial Norte.
- Edificio Corporativo San Isidro.

### Maquinaria

- Excavadora CAT 320.
- Retroexcavadora JCB.
- Grúa Torre Liebherr.
- Compactadora Bomag.
- Montacargas Toyota.

### Sensores

- Sensor de Vibración SEN-VIB-001.
- Sensor de Consumo SEN-ENE-001.
- Sensor Mixto SEN-MIX-001.

### Contratos

- Tarifa por hora.
- Tarifa por día.
- Tarifa mensual.
- Fecha de inicio y fin.

### Telemetría

- Lecturas activas.
- Lecturas inactivas.
- Lecturas sin conexión.
- Lecturas con consumo alto.

---

## 25. Diagramas UML existentes

La carpeta de diagramas replica una estructura tipo tutorial y contiene archivos PlantUML para WorkMeter.

Se espera que existan carpetas como:

```text
workmeter/
├── Activity/
├── Business Use Cases/
├── Class/
├── Collaboration/
├── Components/
├── Conceptual/
├── DDD/
├── Deployment/
├── Packages/
├── Sequence/
├── State/
└── System Use Cases/
```

### Diagramas generados esperados

- Casos de uso de negocio.
- Diagramas de actividad.
- Casos de uso del sistema.
- Diagramas de secuencia.
- Diagramas de clases por bounded context.
- ERD.
- Componentes.
- Despliegue.
- Estados.
- Modelo conceptual.
- DDD.
- Paquetes.
- Colaboración/comunicación.

Estos diagramas deben usarse como guía para implementar la arquitectura y comportamiento del MVP.

---

## 26. Uso de los diagramas UML para implementación

### Business Use Cases

Sirven para entender los macroprocesos:

- Registrar maquinaria y contrato.
- Monitorear uso efectivo.
- Gestionar alertas e incidencias.
- Generar reportes.
- Evaluar continuidad del alquiler.

### Activity

Sirven para implementar flujos paso a paso con decisiones y validaciones.

### System Use Cases

Sirven para definir módulos, pantallas y permisos.

### Sequence

Sirven para definir comunicación entre frontend, backend, base de datos, sensores y servicios.

### Class

Sirven para definir entidades, modelos, DTOs, servicios y relaciones.

### ERD

Sirve para crear la base de datos.

### Components

Sirve para organizar frontend, backend, motores internos y servicios externos.

### Deployment

Sirve para explicar cómo se despliega el sistema.

### State

Sirve para controlar transiciones válidas de entidades.

### DDD

Sirve para separar responsabilidades por contexto.

### Packages

Sirve para organizar carpetas y módulos.

### Collaboration

Sirve para entender interacción entre objetos durante monitoreo y alertas.

---

## 27. Arquitectura lógica recomendada

```text
Landing Page
     |
     v
Frontend Web autenticado
     |
     v
Backend API
     |
     ├── Auth
     ├── Users
     ├── Machinery
     ├── Contracts
     ├── Sensors
     ├── Telemetry
     ├── Monitoring
     ├── Alerts
     ├── Incidents
     ├── Reports
     ├── Costs
     ├── Optimization
     └── Audit
     |
     v
Base de datos
     |
     v
Simulador de sensores / sensores reales futuros
```

---

## 28. Requisitos no funcionales

### Seguridad

- Contraseñas hasheadas.
- Tokens seguros.
- Control de acceso por roles.
- Validación de entradas.
- Protección de rutas privadas.
- No exponer contraseñas.
- Registrar acciones críticas.

### Rendimiento

- El dashboard debe responder en menos de 2 segundos bajo condiciones normales.
- La consulta de estado debe ser rápida.
- La simulación de telemetría no debe bloquear el sistema.

### Disponibilidad

- La plataforma debe buscar disponibilidad igual o superior al 95% en el contexto académico del sprint.

### Usabilidad

- Dashboard claro.
- Indicadores visuales.
- Estados con colores.
- Alertas visibles.
- Formularios simples.
- Mensajes de error entendibles.

### Mantenibilidad

- Código modular.
- Separación frontend/backend.
- Servicios independientes por dominio.
- Nombres claros.
- Documentación en README.
- Variables de entorno.

### Escalabilidad

- El diseño debe permitir agregar sensores reales en el futuro.
- El diseño debe permitir más obras y máquinas.
- El diseño debe permitir reportes avanzados.

---

## 29. Prioridades de implementación

### Prioridad alta

- Login.
- Dashboard.
- Registro de maquinaria.
- Registro de contrato.
- Asociación de sensor.
- Simulación de telemetría.
- Estado activo/inactivo.
- Alerta por inactividad.
- Costo por inactividad.

### Prioridad media

- Reporte diario.
- Incidencias.
- Exportación PDF.
- Consumo energético.
- Filtros por obra.
- Comparación horas activas/inactivas.

### Prioridad baja

- Roles avanzados.
- Auditoría completa.
- Recomendaciones avanzadas.
- Tendencias.
- Reporte final completo.
- BI externo.

---

## 30. Criterios de aceptación del MVP

El MVP puede considerarse funcional cuando:

- Un usuario puede iniciar sesión.
- Un administrador puede registrar maquinaria.
- Un administrador puede registrar contrato de alquiler.
- Un administrador puede asociar un sensor simulado.
- El sistema puede generar o recibir lecturas simuladas.
- El sistema clasifica máquinas como activas o inactivas.
- El dashboard muestra el estado de las máquinas.
- El sistema genera alerta por inactividad mayor a 30 minutos.
- El supervisor puede ver detalle de alerta.
- El supervisor puede registrar incidencia.
- El sistema calcula costo por inactividad.
- El administrador puede generar un reporte diario.
- La landing page explica correctamente el producto.
- Las reglas de negocio principales se cumplen.

---

## 31. Flujo principal del MVP

1. Usuario entra a landing page.
2. Usuario hace clic en ingresar.
3. Usuario inicia sesión.
4. Administrador registra una obra.
5. Administrador registra una maquinaria.
6. Administrador registra contrato de alquiler.
7. Administrador asocia sensor simulado.
8. Backend genera telemetría simulada.
9. Sistema clasifica estado de máquina.
10. Dashboard muestra activo/inactivo.
11. Si hay inactividad prolongada, sistema genera alerta.
12. Supervisor revisa alerta.
13. Supervisor registra incidencia.
14. Sistema calcula costo por inactividad.
15. Administrador genera reporte.

---

## 32. Consideraciones de UI

Colores sugeridos:

- Verde: activo, correcto, eficiente.
- Amarillo: inactivo o advertencia.
- Rojo: alerta crítica, costo desperdiciado.
- Azul: información general.
- Gris: sin conexión o archivado.

Componentes visuales sugeridos:

- Cards de métricas.
- Tabla de maquinaria.
- Gráficos de barras.
- Gráficos de línea.
- Badges de estado.
- Panel lateral.
- Modal para incidencias.
- Filtros de fecha.
- Botones de exportación.

---

## 33. Métricas principales

Dashboard:

- Porcentaje de uso efectivo.
- Horas activas.
- Horas inactivas.
- Costo desperdiciado.
- Máquinas activas.
- Máquinas inactivas.
- Alertas abiertas.
- Incidencias pendientes.
- Consumo energético acumulado.

Reportes:

- Total de horas activas.
- Total de horas inactivas.
- Costo total por inactividad.
- Comparación por máquina.
- Promedio de utilización.
- Ahorro proyectado.

---

## 34. Fórmulas sugeridas

### Uso efectivo

```text
uso_efectivo_porcentaje = horas_activas / (horas_activas + horas_inactivas) * 100
```

### Horas inactivas

```text
horas_inactivas = minutos_inactivos / 60
```

### Costo por inactividad

```text
costo_inactividad = horas_inactivas * tarifa_hora
```

Si se tiene tarifa diaria:

```text
tarifa_hora = tarifa_dia / horas_laborales_dia
```

### Ahorro proyectado

```text
ahorro_proyectado = costo_inactividad_estimado - costo_inactividad_reducido
```

---

## 35. Decisiones importantes para agentes IA

Todo agente IA que trabaje en este proyecto debe respetar estas decisiones:

- WorkMeter es una plataforma web, no una app móvil nativa.
- El MVP puede usar sensores simulados.
- La arquitectura debe separar landing page, frontend y backend.
- Los diagramas UML existentes deben guiar la implementación.
- No agregar funcionalidades que contradigan el alcance.
- No convertir el proyecto en un ERP completo.
- No implementar pagos reales.
- No implementar GPS como función principal.
- No implementar mantenimiento físico, solo registro documental.
- Priorizar Release 1.
- Priorizar funcionalidad clara por encima de complejidad técnica.
- Usar nombres de dominio coherentes con el proyecto.
- Mantener trazabilidad entre historias de usuario, diagramas y código.

---

## 36. Posible organización interna del backend

Ejemplo genérico:

```text
backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── works/
│   ├── machinery/
│   ├── contracts/
│   ├── sensors/
│   ├── telemetry/
│   ├── monitoring/
│   ├── alerts/
│   ├── incidents/
│   ├── reports/
│   ├── costs/
│   ├── optimization/
│   ├── audit/
│   ├── shared/
│   └── infrastructure/
├── tests/
├── database/
├── README.md
└── .env.example
```

---

## 37. Posible organización interna del frontend

Ejemplo genérico:

```text
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── styles/
├── public/
├── README.md
└── .env.example
```

Páginas sugeridas:

```text
pages/
├── Login
├── Dashboard
├── Machinery
├── MachineryDetail
├── Contracts
├── Sensors
├── Alerts
├── Incidents
├── Reports
├── Costs
├── Users
├── Audit
└── Settings
```

---

## 38. Posible organización interna de landing-page

```text
landing-page/
├── src/
│   ├── components/
│   ├── sections/
│   ├── pages/
│   └── styles/
├── public/
├── README.md
└── .env.example
```

Secciones sugeridas:

```text
sections/
├── Hero
├── Problem
├── Solution
├── Features
├── HowItWorks
├── Benefits
├── ODS
├── CTA
└── Footer
```

---

## 39. Pruebas recomendadas

### Pruebas de backend

- Login correcto.
- Login incorrecto.
- Crear maquinaria.
- Validar campos obligatorios.
- Crear contrato.
- Asociar sensor.
- Recibir telemetría.
- Clasificar activo/inactivo.
- Generar alerta.
- Registrar incidencia.
- Calcular costo.
- Generar reporte.

### Pruebas de frontend

- Render de login.
- Validación de formularios.
- Dashboard muestra métricas.
- Tabla de maquinaria carga datos.
- Alertas se muestran correctamente.
- Reporte se genera o descarga.

### Pruebas de reglas de negocio

- Inactividad menor a 5 minutos no cambia estado.
- Inactividad mayor a 5 minutos marca inactivo.
- Inactividad mayor a 30 minutos genera alerta.
- Horas inactivas por tarifa calculan costo.
- Baja utilización se resalta.

---

## 40. Definición de terminado

Una funcionalidad está terminada cuando:

- Cumple criterios de aceptación.
- Tiene validaciones.
- Se conecta correctamente con backend o datos simulados.
- No rompe otros módulos.
- Tiene mensajes de error.
- Respeta roles/permisos si aplica.
- Está documentada.
- Tiene datos de prueba o seeders.
- Está alineada con diagramas UML.
- Cumple reglas de negocio relacionadas.

---

## 41. Resumen para agentes IA

WorkMeter debe entenderse como un sistema web modular para monitorear maquinaria alquilada en construcción. El valor principal está en detectar uso efectivo frente a inactividad y traducir esa información en decisiones de costo.

El MVP debe demostrar el flujo completo:

```text
Registrar maquinaria
→ Asociar contrato y sensor
→ Simular telemetría
→ Clasificar estado
→ Mostrar dashboard
→ Generar alerta
→ Registrar incidencia
→ Calcular costo
→ Generar reporte
```

La implementación debe ser sencilla, clara, trazable y alineada con los sprints, diagramas UML y reglas de negocio.
