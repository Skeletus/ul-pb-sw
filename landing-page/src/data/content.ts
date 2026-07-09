export const navItems = [
  { label: "Problema", href: "#problema" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Funciones", href: "#funciones" },
  { label: "Precios", href: "#precios" },
  { label: "Contacto", href: "#contacto" }
];

export const painPoints = [
  "Maquinaria encendida, pero sin producir.",
  "Equipos inactivos durante largos periodos.",
  "Costos de alquiler sin aporte real a productividad.",
  "Consumo de energia o combustible innecesario.",
  "Dependencia de reportes manuales, observacion directa o estimaciones poco confiables."
];

export const solutionPoints = [
  "Sensores de vibracion y consumo energetico capturan lecturas de uso.",
  "WorkMeter clasifica si la maquinaria esta activa, inactiva, encendida sin uso productivo o sin conexion.",
  "El dashboard muestra estado operativo, alertas, costos desperdiciados y reportes de uso."
];

export const howItWorks = [
  {
    step: "01",
    title: "Sensoriza la maquinaria alquilada",
    description:
      "Asocia sensores a cada maquina registrada junto con su contrato de alquiler."
  },
  {
    step: "02",
    title: "Captura telemetria operativa",
    description:
      "Los sensores envian vibracion, consumo energetico, estado de conexion, fecha y hora de cada lectura."
  },
  {
    step: "03",
    title: "Clasifica activo o inactivo",
    description:
      "Si vibracion o consumo estan bajo el umbral operativo por mas de 5 minutos, WorkMeter clasifica la maquinaria como inactiva."
  },
  {
    step: "04",
    title: "Reporta, alerta y calcula costo",
    description:
      "El sistema actualiza indicadores, genera alertas por inactividad prolongada y calcula costo de inactividad con la tarifa del contrato."
  }
];

export const mainFeatures = [
  {
    title: "Monitoreo en tiempo real o casi real",
    description:
      "Visualiza el estado activo o inactivo de la maquinaria y detecta tiempos muertos desde un panel operativo claro."
  },
  {
    title: "Reportes automaticos de uso",
    description:
      "Consolida horas de uso, eficiencia operativa y resumen diario para sustentar decisiones de obra."
  },
  {
    title: "Alertas de inactividad",
    description:
      "Advierte cuando una maquina permanece detenida demasiado tiempo para que el equipo pueda actuar a tiempo."
  },
  {
    title: "Analisis de costos",
    description:
      "Convierte las horas inactivas en costo desperdiciado usando la tarifa del contrato de alquiler."
  }
];

export const upcomingFeatures = [
  "Configuracion avanzada de alertas",
  "Indicadores de ahorro proyectado",
  "Analizar tendencias de uso",
  "Generar reporte final de optimizacion"
];

export const pricingPlans = [
  {
    name: "Basico",
    price: "S/299",
    description: "Para obras pequenas que necesitan monitorear maquinaria esencial.",
    features: [
      "Monitoreo de maquinaria seleccionada",
      "Alertas basicas de inactividad",
      "Reportes diarios de uso",
      "Indicadores de horas activas e inactivas"
    ]
  },
  {
    name: "Estandar",
    price: "S/699",
    description: "Para constructoras que necesitan mayor control operativo y financiero.",
    features: [
      "Dashboard de monitoreo en tiempo real",
      "Comparacion de horas activas vs. inactivas",
      "Calculo de costo por inactividad",
      "Reportes descargables"
    ],
    highlighted: true
  },
  {
    name: "Premium",
    price: "S/1,499",
    description: "Para operaciones con multiples frentes de obra y analisis avanzado.",
    features: [
      "Monitoreo de multiples obras",
      "Indicadores de ahorro proyectado",
      "Analisis de tendencias de uso",
      "Reporte final de optimizacion"
    ]
  }
];
