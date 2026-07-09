import Image from "next/image";
import {
  howItWorks,
  mainFeatures,
  navItems,
  painPoints,
  pricingPlans,
  solutionPoints,
  upcomingFeatures
} from "@/data/content";

const metricRows = [
  { label: "Uso efectivo", value: "76%", tone: "bg-emerald-500" },
  { label: "Horas inactivas", value: "18.5 h", tone: "bg-workmeter-safety" },
  { label: "Costo desperdiciado", value: "S/ 2,140", tone: "bg-red-500" }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-workmeter-ink">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a className="flex items-center gap-3" href="#inicio" aria-label="WorkMeter inicio">
            <span className="grid h-10 w-10 place-items-center rounded bg-workmeter-orange text-sm font-black text-white">
              WM
            </span>
            <span className="text-lg font-black tracking-normal text-workmeter-ink">WorkMeter</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-workmeter-steel md:flex">
            {navItems.map((item) => (
              <a key={item.href} className="transition hover:text-workmeter-orange" href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <a
            className="inline-flex h-11 items-center justify-center rounded bg-workmeter-blue px-5 text-sm font-bold text-white transition hover:bg-workmeter-ink"
            href="#contacto"
          >
            Solicitar demo
          </a>
        </div>
      </header>

      <section id="inicio" className="relative overflow-hidden bg-workmeter-concrete">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded bg-workmeter-cyan px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-workmeter-rust">
              Plataforma web para construccion
            </p>
            <h1 className="text-5xl font-black leading-[1.02] tracking-normal text-workmeter-ink sm:text-6xl lg:text-7xl">
              WorkMeter
            </h1>
            <p className="mt-6 text-xl font-semibold leading-8 text-workmeter-steel sm:text-2xl">
              Reduce costos innecesarios asociados al alquiler de maquinaria pesada mediante monitoreo de uso efectivo, deteccion de inactividad y reportes de costos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex h-12 items-center justify-center rounded bg-workmeter-orange px-6 text-base font-black text-white shadow-industrial transition hover:bg-workmeter-rust"
                href="#contacto"
              >
                Solicitar demo
              </a>
              <a
                className="inline-flex h-12 items-center justify-center rounded border border-workmeter-blue px-6 text-base font-black text-workmeter-blue transition hover:bg-white"
                href="#como-funciona"
              >
                Ver como funciona
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-industrial">
              <Image
                src="/images/workmeter-hero.png"
                width={1400}
                height={900}
                priority
                alt="Obra de construccion con maquinaria alquilada monitoreada por telemetria"
                className="h-[420px] w-full object-cover lg:h-[560px]"
              />
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded border border-white/60 bg-workmeter-ink/88 p-4 text-white shadow-industrial backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-sm font-black">Panel operativo</p>
                <span className="rounded bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
                  Telemetria activa
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {metricRows.map((metric) => (
                  <div key={metric.label} className="rounded bg-white/10 p-3">
                    <div className={`mb-3 h-1.5 w-12 rounded ${metric.tone}`} />
                    <p className="text-xs text-slate-300">{metric.label}</p>
                    <p className="mt-1 text-xl font-black">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problema" className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="section-kicker">Problema</p>
            <h2 className="section-title">La maquinaria alquilada puede estar costando sin producir.</h2>
            <p className="section-copy">
              WorkMeter responde a la falta de visibilidad sobre el uso real de los equipos en obra. Sin monitoreo, las decisiones dependen de observacion directa, reportes manuales o estimaciones poco confiables.
            </p>
          </div>
          <div className="grid gap-3">
            {painPoints.map((point) => (
              <div key={point} className="border-l-4 border-workmeter-orange bg-workmeter-concrete px-5 py-4 text-base font-semibold text-workmeter-steel">
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-workmeter-ink py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="section-kicker text-workmeter-cyan">Solucion</p>
            <h2 className="section-title text-white">Telemetria, alertas y costos en un flujo operativo.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {solutionPoints.map((point) => (
              <article key={point} className="rounded border border-white/12 bg-white/7 p-6">
                <p className="text-base font-semibold leading-7 text-slate-100">{point}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-workmeter-concrete py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="section-kicker">Como funciona</p>
            <h2 className="section-title">De sensores a reportes de uso y costos.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <article key={item.step} className="rounded border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-black text-workmeter-orange">{item.step}</p>
                <h3 className="mt-4 text-xl font-black text-workmeter-ink">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-workmeter-steel">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="funciones" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="section-kicker">Funcionalidades principales</p>
              <h2 className="section-title">Control operativo y financiero de la maquinaria alquilada.</h2>
              <p className="section-copy">
                WorkMeter reune las funciones esenciales para monitorear maquinaria alquilada, detectar inactividad, generar alertas y visualizar el impacto economico en obra.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {mainFeatures.map((feature) => (
                <article key={feature.title} className="rounded border border-slate-200 p-6">
                  <h3 className="text-lg font-black text-workmeter-ink">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-workmeter-steel">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-workmeter-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="section-kicker text-workmeter-cyan">Funciones avanzadas planificadas</p>
            <h2 className="section-title text-white">Mas visibilidad para operaciones de mayor escala.</h2>
            <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
              La plataforma esta pensada para crecer con constructoras que necesitan mas control, analisis historico y evidencia para optimizar el alquiler de equipos.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {upcomingFeatures.map((feature) => (
              <article key={feature} className="rounded border border-white/12 bg-white/7 p-5">
                <p className="text-base font-black leading-6 text-white">{feature}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-workmeter-concrete py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-1">
            <p className="section-kicker">Impacto</p>
            <h2 className="section-title">Indicadores para decidir continuidad, retiro o reasignacion.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
            {["Horas activas", "Horas inactivas", "Costo por inactividad"].map((item) => (
              <div key={item} className="rounded border border-slate-200 bg-white p-6">
                <p className="text-lg font-black text-workmeter-ink">{item}</p>
                <p className="mt-3 text-sm leading-6 text-workmeter-steel">
                  Metrica operativa para entender que equipos estan generando trabajo productivo.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precios" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="section-kicker">Planes</p>
            <h2 className="section-title">Planes para cada tipo de obra.</h2>
            <p className="section-copy">
              Elige el plan segun la cantidad de maquinaria, nivel de monitoreo y necesidades de reportes de tu operacion.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded border p-7 ${
                  plan.highlighted
                    ? "border-workmeter-orange bg-workmeter-ink text-white shadow-industrial"
                    : "border-slate-200 bg-white text-workmeter-ink"
                }`}
              >
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <p className={`mt-5 text-5xl font-black ${plan.highlighted ? "text-workmeter-cyan" : "text-workmeter-blue"}`}>
                  {plan.price}
                </p>
                <p className={`mt-5 text-sm font-semibold leading-6 ${plan.highlighted ? "text-slate-100" : "text-workmeter-steel"}`}>
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex gap-3 text-sm font-semibold leading-6 ${plan.highlighted ? "text-slate-100" : "text-workmeter-steel"}`}>
                      <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${plan.highlighted ? "bg-workmeter-orange" : "bg-workmeter-blue"}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  className={`mt-7 inline-flex h-11 w-full items-center justify-center rounded text-sm font-black transition ${
                    plan.highlighted
                      ? "bg-workmeter-orange text-white hover:bg-workmeter-rust"
                      : "bg-workmeter-blue text-white hover:bg-workmeter-ink"
                  }`}
                  href="#contacto"
                >
                  Solicitar demo
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-workmeter-ink py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="section-kicker text-workmeter-cyan">Contacto</p>
            <h2 className="section-title text-white">Solicita una demo de WorkMeter.</h2>
            <p className="mt-5 text-base leading-7 text-slate-300">
              Dejanos tus datos y te contactaremos para coordinar una demostracion de la plataforma.
            </p>
          </div>
          <form className="rounded border border-white/12 bg-white/7 p-6" aria-label="Formulario de contacto estatico">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-label">
                Nombre
                <input className="form-input" name="name" placeholder="Tu nombre" />
              </label>
              <label className="form-label">
                Empresa
                <input className="form-input" name="company" placeholder="Constructora" />
              </label>
              <label className="form-label md:col-span-2">
                Correo
                <input className="form-input" name="email" placeholder="correo@empresa.com" type="email" />
              </label>
              <label className="form-label md:col-span-2">
                Mensaje
                <textarea className="form-input min-h-32 resize-y" name="message" placeholder="Cuentanos que maquinaria alquilada necesitas monitorear" />
              </label>
            </div>
            <button className="mt-5 h-12 w-full rounded bg-workmeter-orange px-6 text-base font-black text-white transition hover:bg-workmeter-rust" type="button">
              Solicitar demo
            </button>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Nuestro equipo revisara tu solicitud y se comunicara contigo para conocer las necesidades de monitoreo de tu obra.
            </p>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-workmeter-steel md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="font-bold">WorkMeter · Energy-Saver</p>
          <p>© 2026 WorkMeter. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
