# WorkMeter UML

Este directorio replica la estructura de `tutorial` y contiene diagramas PlantUML para el proyecto WorkMeter.

Nota: `workmeter/CONTEXT.MD` fue leido antes de generar los diagramas, pero el archivo esta vacio. Los diagramas se basan estrictamente en el contexto y reglas de negocio indicados en la solicitud.

## Diagramas generados

- `Business Use Cases/business_use_cases_workmeter.puml`: casos de uso de negocio y macroprocesos.
- `Activity/*.puml`: flujos de registro, monitoreo, alertas, reportes y optimizacion.
- `System Use Cases/system_use_cases_workmeter.puml`: casos de uso del sistema con limite de WorkMeter, actores, `include` y `extend`.
- `Sequence/*.puml`: secuencias para registro, monitoreo, alerta/incidencia, reporte y continuidad del alquiler.
- `Class/cases/*.puml`: clases por bounded context.
- `Class/erd/erd_workmeter.puml`: modelo entidad-relacion con PK, FK y cardinalidades.
- `Class/3.association`, `Class/6.aggregation`, `Class/7.composition`, `Class/8.generalization`, `Class/9.realization` y `Class/10.dependency`: ejemplos de relaciones UML aplicadas a WorkMeter.
- `Components/components_workmeter.puml`: componentes de frontend, backend, APIs, motores, base de datos y servicios externos.
- `Deployment/deployment_workmeter.puml`: despliegue en obra, navegadores, servidores, telemetria, base de datos y servicios externos.
- `State/*.puml`: estados de maquinaria, contrato, sensor, alerta, incidencia y reporte.
- `Conceptual/conceptual_workmeter.puml`: modelo conceptual del dominio.
- `DDD/bounded_contexts_workmeter.puml` y `DDD/aggregates_workmeter.puml`: bounded contexts y agregados.
- `Packages/packages_workmeter.puml`: paquetes de arquitectura.
- `Collaboration/collaboration_monitoreo_alerta.puml`: comunicacion durante monitoreo y generacion de alerta.

## Reglas de negocio representadas

- Inactividad por valores bajo umbral durante mas de 5 minutos.
- Alertas de alta prioridad por inactividad mayor a 30 minutos o umbral configurado superado.
- Calculo de costo por inactividad con horas inactivas y tarifa del contrato.
- Resaltado de maquinaria con baja utilizacion.
- Reportes filtrables por obra, maquinaria y rango de fechas.
- Acceso controlado por roles y permisos.
- Auditoria de acciones criticas.
- Reporte final con ahorros, incidencias resueltas y recomendaciones.
