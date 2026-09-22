"use client";

import { useMemo, useRef, useState } from "react";
import ClinicTour from "./components/ClinicTour";

const PHONE = "51963477926";
const wa = (message: string) => `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;

const cases = [
  ["Megadent", "7554089040656518412", "https://vt.tiktok.com/ZSHctX5vB/", "Consultorio categorizado en Lima"],
  ["Santa Lucía", "7482194984259702021", "https://vt.tiktok.com/ZSHgg4FkP/", "Aprendizaje y prevención de riesgos"],
  ["MK Dental", "7548832023339830533", "https://vt.tiktok.com/ZSHggDJHn/", "Requisitos para abrir y categorizar"],
  ["Soredent", "7598202034407345415", "https://vt.tiktok.com/ZSHgbA9dq/", "Logró su categorización"],
  ["Dra. Daniela", "7591463298315472136", "https://vt.tiktok.com/ZSHgbwSRj/", "Sí es posible categorizar"],
  ["Sanar", "7507755125755235589", "https://vt.tiktok.com/ZSHggeYoM/", "Cumplió los requisitos"],
  ["Atracción Dental", "7501345430517714231", "https://vt.tiktok.com/ZSHsKGrx6/", "Cuenta su experiencia"],
  ["Goldent", "7485407572925648183", "https://vt.tiktok.com/ZSH7kKt34/", "Caso categorizado en Huaraz"],
  ["Sonrisa Molar", "7455122176463670534", "https://vt.tiktok.com/ZSH7B1pGK/", "Abrió y categorizó"],
  ["Estrella Dent", "7455111101974465798", "https://vt.tiktok.com/ZSH7BNt6X/", "Cumplió los requisitos"],
  ["JR Dental", "7411529145366170886", "https://vt.tiktok.com/ZSH7BYnga/", "Resolución de categorización"],
  ["Pekitas", "7409907327861607685", "https://vt.tiktok.com/ZSH7kn3XD/", "Logró categorizar"],
  ["A&C Dental Center", "7379007096857185541", "https://vt.tiktok.com/ZSH7kw97E/", "Abrió y categorizó sin problemas"],
] as const;

const services = [
  ["PDF", "Guía especializada", "S/ 55", "S/ 35", "Conceptos, normas, pasos y recomendaciones prácticas."],
  ["01", "Diagnóstico virtual", "S/ 850", "S/ 650", "Videollamada para revisar situación, documentos y próximos pasos."],
  ["DOC", "Documentos de gestión y expediente DIRIS", "S/ 1,700", "S/ 1,300", "Elaboración y conformación del expediente según el caso."],
  ["DIR", "Tramitación de sello DIRIS", "S/ 1,400", "S/ 850", "Presentación, gestión y coordinación administrativa."],
  ["SEG", "Seguimiento de expediente", "", "S/ 150", "Visita de acompañamiento durante el proceso."],
] as const;

const clinicStages = [
  ["./clinic-stage-00.webp", "Recepción organizada"],
  ["./clinic-stage-01.webp", "Sala de espera"],
  ["./clinic-stage-02.webp", "Ingreso y circulación"],
  ["./clinic-stage-03.webp", "Servicios higiénicos"],
  ["./clinic-stage-04.webp", "Señalización de ambientes"],
  ["./clinic-stage-05.webp", "Lavamanos clínico"],
  ["./clinic-stage-06.webp", "Gestión de residuos"],
  ["./clinic-stage-07.webp", "Área de esterilización"],
  ["./clinic-stage-08.webp", "Consultorio odontológico"],
  ["./clinic-stage-09.webp", "Ambiente clínico equipado"],
  ["./clinic-stage-10.webp", "Modelo integral del consultorio"],
] as const;

type ReadinessAnswer = "yes" | "no" | "unknown" | "na";

const readinessItems = [
  { id: "compatibility", area: "Local", label: "¿El inmueble tiene compatibilidad de uso para servicios de salud?", short: "Compatibilidad de uso", weight: 9, critical: true },
  { id: "finishes", area: "Local", label: "¿Los pisos son antideslizantes y las superficies son lavables y fáciles de limpiar?", short: "Acabados sanitarios", weight: 5 },
  { id: "accessibility", area: "Local", label: "¿El ingreso y la circulación son accesibles, seguros y sin obstáculos?", short: "Accesibilidad y circulación", weight: 6, critical: true },
  { id: "room", area: "Consultorio", label: "¿El consultorio tiene al menos 14 m² y 3 m de ancho?", short: "Área mínima del consultorio", weight: 9, critical: true },
  { id: "sink", area: "Consultorio", label: "¿Existe un lavamanos operativo dentro del consultorio?", short: "Lavamanos clínico", weight: 8, critical: true },
  { id: "waiting", area: "Consultorio", label: "¿La sala de espera dispone de espacio suficiente y accesible?", short: "Sala de espera", weight: 4 },
  { id: "sterilization", area: "Bioseguridad", label: "¿La esterilización mantiene un flujo unidireccional: sucio, limpio y estéril?", short: "Flujo de esterilización", weight: 9, critical: true },
  { id: "waste", area: "Bioseguridad", label: "¿Se segregan residuos comunes, biocontaminados, especiales y punzocortantes?", short: "Segregación de residuos", weight: 7, critical: true },
  { id: "records", area: "Gestión", label: "¿Tiene manuales, historias clínicas, odontograma y registros de bioseguridad actualizados?", short: "Documentos de gestión", weight: 5 },
  { id: "radiology", area: "Gestión", label: "Si utiliza rayos X, ¿dispone de licencia, control de calidad y protección radiológica vigentes?", short: "Documentación radiológica", weight: 5, critical: true, allowNA: true },
] as const;

const stageLabels: Record<string, string> = {
  opening: "Voy a abrir",
  operating: "Ya estoy atendiendo",
  remodel: "Voy a remodelar",
  update: "Actualizar o recategorizar",
};

function planFor(stage: string, score: number, criticalFailures: number, chairs: number) {
  if (stage === "operating" || criticalFailures >= 3 || score < 45) return { name: "Plan VIP", price: "Desde S/ 4,000 al contado", title: "Necesitas una revisión integral", copy: "Hay brechas importantes o una operación en marcha. Conviene priorizar diagnóstico, expediente, tramitación y seguimiento." };
  if (["opening", "remodel"].includes(stage) || chairs > 1 || criticalFailures > 0 || score < 80) return { name: "Plan Completo", price: "Desde S/ 3,200 al contado", title: "Valida y corrige antes de presentar", copy: "Tu proyecto se beneficia de revisar el local, ordenar la distribución y preparar el expediente como una sola ruta." };
  return { name: "Plan Básico", price: "Desde S/ 1,800 al contado", title: "Tu prioridad es ordenar el expediente", copy: "Tienes varias condiciones resueltas. Un diagnóstico virtual confirmará si basta con consolidar documentos y expediente." };
}

export default function Home() {
  const [stage, setStage] = useState("opening");
  const [area, setArea] = useState(60);
  const [chairs, setChairs] = useState(1);
  const [answers, setAnswers] = useState<Record<string, ReadinessAnswer>>({});
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<(typeof cases)[number] | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const scoredItems = readinessItems.filter((item) => answers[item.id] !== "na");
  const totalWeight = scoredItems.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = scoredItems.reduce((sum, item) => {
    const answer = answers[item.id];
    return sum + item.weight * (answer === "yes" ? 1 : answer === "unknown" ? .3 : 0);
  }, 0);
  const score = totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const answeredCount = readinessItems.filter((item) => Boolean(answers[item.id])).length;
  const clinicStage = clinicStages[Math.min(answeredCount, clinicStages.length - 1)];
  const criticalFailures = readinessItems.filter((item) => ("critical" in item && item.critical) && answers[item.id] === "no");
  const plan = planFor(stage, score, criticalFailures.length, chairs);
  const enoughAnswers = answeredCount === readinessItems.length;
  const readiness = !enoughAnswers
    ? { label: "Evaluación en curso", title: `Completa las ${readinessItems.length} preguntas`, copy: "Así podremos darte una lectura más útil de tu preparación y de las brechas prioritarias." }
    : criticalFailures.length > 0
      ? { label: "Brechas críticas", title: "Aún no conviene presentar el expediente", copy: `Detectamos ${criticalFailures.length} condición${criticalFailures.length === 1 ? "" : "es"} crítica${criticalFailures.length === 1 ? "" : "s"} por corregir antes de solicitar una evaluación técnica.` }
      : score >= 80
        ? { label: "Preparación alta", title: "Podrías avanzar a una validación técnica", copy: "La muestra indica una base favorable. Falta contrastarla con el instrumento completo, los documentos y la autoridad correspondiente." }
        : score >= 60
          ? { label: "Preparación media", title: "Puedes avanzar después de corregir brechas", copy: "Tu base es aprovechable, pero todavía hay puntos que conviene resolver antes de presentar el expediente." }
          : { label: "Preparación inicial", title: "Prioriza el diagnóstico y la adecuación", copy: "La muestra revela brechas relevantes. Una revisión técnica evitará invertir en cambios que luego deban repetirse." };
  const areaScores = Array.from(new Set(readinessItems.map((item) => item.area))).map((areaName) => {
    const items = readinessItems.filter((item) => item.area === areaName && answers[item.id] !== "na");
    const max = items.reduce((sum, item) => sum + item.weight, 0);
    const value = items.reduce((sum, item) => sum + item.weight * (answers[item.id] === "yes" ? 1 : answers[item.id] === "unknown" ? .3 : 0), 0);
    return { name: areaName, value: max ? Math.round((value / max) * 100) : 0 };
  });
  const resultMessage = useMemo(() => [
    enoughAnswers ? "Hola, completé el autodiagnóstico de Categorización Dental." : "Hola, inicié el autodiagnóstico de Categorización Dental.",
    `Etapa: ${stageLabels[stage]}.`,
    `Local: ${area} m² y ${chairs} sillón${chairs === 1 ? "" : "es"}.`,
    `Criterios respondidos: ${answeredCount}/${readinessItems.length}.`,
    enoughAnswers ? `Preparación orientativa: ${score}%.` : "Evaluación pendiente: faltan respuestas.",
    `Estado: ${readiness.label}.`,
    criticalFailures.length ? `Alertas críticas: ${criticalFailures.map((item) => item.short).join(", ")}.` : "Sin alertas críticas declaradas en esta muestra.",
    enoughAnswers ? `Plan sugerido: ${plan.name}.` : "Deseo completar mi evaluación.",
    "Deseo validar este resultado y recibir una propuesta.",
  ].join("\n"), [stage, area, chairs, score, answeredCount, enoughAnswers, readiness.label, criticalFailures, plan.name]);

  const openVideo = (item: (typeof cases)[number]) => {
    setActiveVideo(item);
    setTimeout(() => dialogRef.current?.showModal(), 0);
    document.body.classList.add("modal-open");
  };
  const closeVideo = () => {
    dialogRef.current?.close();
    document.body.classList.remove("modal-open");
    setActiveVideo(null);
  };

  return <>
    <a className="skip-link" href="#contenido">Ir al contenido</a>
    <header className="site-header" id="inicio"><div className="shell nav-wrap">
      <a className="brand" href="#inicio" aria-label="Categorización Dental, inicio"><span><strong>Categorización</strong><small>Dental</small></span></a>
      <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>Menú</button>
      <nav id="main-nav" className={menuOpen ? "open" : ""} aria-label="Navegación principal" onClick={() => setMenuOpen(false)}><a href="#autodiagnostico">Autodiagnóstico</a><a href="#planes">Planes</a><a href="#casos">Casos reales</a><a href="#proceso">Proceso</a></nav>
      <a className="button button-small nav-cta" href={wa("Hola, deseo una orientación para categorizar mi consultorio dental.")} target="_blank" rel="noreferrer">Hablar por WhatsApp</a>
    </div></header>

    <main id="contenido">
      <ClinicTour><div className="hero-copy reveal"><p className="eyebrow"><span /> Especialistas en categorización odontológica</p><h1>Formaliza tu consultorio <em>sin invertir a ciegas.</em></h1><p className="hero-lead">Convertimos un proceso técnico y confuso en una ruta clara: diagnóstico, documentos de gestión, expediente, tramitación y seguimiento.</p><div className="hero-actions"><a className="button" href="#autodiagnostico">Hacer autodiagnóstico</a><a className="button button-ghost" href={wa("Hola, deseo saber qué plan necesito para mi consultorio dental.")} target="_blank" rel="noreferrer">Consultar mi caso</a></div><div className="hero-proof"><div><strong>57+</strong><span>consultorios acompañados</span></div><div><strong>10+</strong><span>años de experiencia</span></div><div><strong>Perú</strong><span>atención nacional</span></div></div></div></ClinicTour>

      <section className="problem-strip" aria-label="Decisiones que ayudamos a resolver"><div className="shell strip-grid"><p><span>01</span> ¿Mi local realmente sirve?</p><p><span>02</span> ¿Qué categoría me corresponde?</p><p><span>03</span> ¿Cuánto debo presupuestar?</p><p><span>04</span> ¿Qué me falta antes de la inspección?</p></div></section>

      <section className="section diagnosis-section" id="autodiagnostico"><div className="shell">
        <div className="section-heading narrow reveal"><p className="eyebrow"><span /> Evaluación inicial gratuita</p><h2>Descubre tu ruta y nivel de preparación</h2><p>Responde datos básicos de tu proyecto. Recibirás un nivel de preparación y el plan de acompañamiento sugerido.</p></div>
        <details className="diagnosis-disclosure"><summary><span><strong>Comenzar mi autodiagnóstico</strong><small>10 preguntas · {answeredCount} respondidas</small></span><span className="disclosure-symbol" aria-hidden="true">+</span></summary><div className="diagnosis-layout"><form className="diagnosis-form">
          <div className="stage-scene"><img key={stage} src={stage === "opening" ? "./modelo-distribucion.jpeg" : stage === "operating" ? "./modelo-consultorio.jpeg" : stage === "remodel" ? "./dentix-clinica.png" : "./modelo-esterilizacion.jpeg"} alt={`Referencia de consultorio: ${stageLabels[stage]}`} width="1008" height="1260" loading="lazy"/><div><span>Tu próximo paso</span><strong>{stageLabels[stage]}</strong><small>Modelo referencial de consultorio</small></div></div><div className="form-block"><div className="question-title"><span>1</span><h3>¿En qué etapa estás?</h3></div><div className="choice-grid">{[["opening","Voy a abrir","Estoy buscando o implementando un local"],["operating","Ya atiendo","Necesito formalizar o corregir observaciones"],["remodel","Voy a remodelar","Quiero evitar gastos y cambios duplicados"],["update","Actualizar o recategorizar","Mi establecimiento ya está registrado"]].map(([value,title,note]) => <label className="choice" key={value}><input type="radio" name="stage" checked={stage===value} onChange={() => setStage(value)} /><span><strong>{title}</strong><small>{note}</small></span></label>)}</div></div>
          <div className="form-block two-cols"><div><div className="question-title"><span>2</span><h3>Metraje del local</h3></div><div className="range-row"><input type="range" min="20" max="160" value={area} aria-label="Metraje del local" onChange={(e)=>setArea(Number(e.target.value))} /><output>{area} m²</output></div></div><div><div className="question-title"><span>3</span><h3>Número de sillones</h3></div><div className="counter" role="group" aria-label="Número de sillones odontológicos"><button type="button" aria-label="Restar un sillón" onClick={()=>setChairs(Math.max(1,chairs-1))}>−</button><output>{chairs}</output><button type="button" aria-label="Agregar un sillón" onClick={()=>setChairs(Math.min(8,chairs+1))}>+</button></div></div></div>
          <div className="form-block"><div className="question-title"><span>4</span><h3>Evalúa las condiciones principales</h3></div><p className="question-help">Selección orientativa de 10 criterios clave. Responde con honestidad; “No sé” cuenta como una alerta de verificación.</p><div className="evaluation-progress"><span>{answeredCount} de {readinessItems.length} respondidos</span><div><i style={{width:`${Math.round(answeredCount/readinessItems.length*100)}%`}} /></div></div><div className="assessment-list">{readinessItems.map((item,index)=><div className={`assessment-accordion ${openQuestion === item.id ? "is-open" : ""} ${answers[item.id] ? "is-answered" : ""}`} key={item.id}>
            <h4><button type="button" className="assessment-toggle" aria-expanded={openQuestion === item.id} aria-controls={`answer-${item.id}`} id={`question-${item.id}`} onClick={()=>setOpenQuestion(openQuestion === item.id ? null : item.id)}><span className="question-number">{String(index+1).padStart(2,"0")}</span><span className="question-label">{item.label}<small>{item.area}{("critical" in item && item.critical) ? " · Prioritario" : ""}</small></span><span className={`answer-summary answer-${answers[item.id] || "pending"}`}>{answers[item.id] ? ({yes:"Cumple",no:"No cumple",unknown:"No sé",na:"No aplica"})[answers[item.id]] : "Responder"}</span><span className="question-chevron" aria-hidden="true">⌄</span></button></h4>
            <div id={`answer-${item.id}`} hidden={openQuestion !== item.id} role="region" aria-labelledby={`question-${item.id}`}><fieldset className="answer-fieldset"><legend className="sr-only">{item.label}</legend><div className="answer-options">{[["yes","Cumple"],["no","No cumple"],["unknown","No sé"],...("allowNA" in item && item.allowNA ? [["na","No aplica"]] : [])].map(([value,label])=><label key={value}><input type="radio" name={item.id} checked={answers[item.id]===value} onChange={()=>setAnswers({...answers,[item.id]:value as ReadinessAnswer})}/><span>{label}</span></label>)}</div></fieldset></div>
          </div>)}</div></div>
        </form><aside className="result-panel" aria-live="polite"><figure className="clinic-progress-visual"><div><img key={clinicStage[0]} src={clinicStage[0]} alt={`Modelo 3D del consultorio: ${clinicStage[1]}`} width="1200" height="1500" style={{transform:`scale(${1 + answeredCount * .014}) translateZ(${answeredCount * 2}px)`}} /></div><figcaption><span>Vista {answeredCount + 1} de {clinicStages.length}</span><strong>{clinicStage[1]}</strong><small>{answeredCount === readinessItems.length ? "Recorrido completado" : "La imagen avanza con tu diagnóstico"}</small></figcaption></figure><p className="result-kicker">Tu preevaluación en tiempo real</p><div className="score-value"><strong>{enoughAnswers ? `${score}%` : `${answeredCount}/${readinessItems.length}`}</strong><span>{enoughAnswers ? "preparación orientativa" : "preguntas respondidas"}</span></div><div className="score-bar"><i style={{width:`${score}%`}} /></div><span className={`status-badge ${criticalFailures.length?"status-alert":""}`}>{readiness.label}</span><h3>{readiness.title}</h3><p>{readiness.copy}</p>{criticalFailures.length>0&&<div className="critical-alert"><strong>Corrige primero</strong><ul>{criticalFailures.slice(0,4).map((item)=><li key={item.id}>{item.short}</li>)}</ul></div>}<div className="area-results">{areaScores.map((item)=><div key={item.name}><span><b>{item.name}</b><em>{item.value}%</em></span><i><u style={{width:`${item.value}%`}} /></i></div>)}</div>{enoughAnswers&&<div className="recommendation"><span>Plan sugerido</span><strong>{plan.name}</strong><small>{plan.price}</small></div>}<p className="fine-print">Herramienta orientativa basada en una muestra del instrumento adjunto. No sustituye una inspección, una revisión documental completa ni garantiza la categorización; la decisión corresponde a la autoridad competente.</p><a className="button button-full" href={wa(resultMessage)} target="_blank" rel="noreferrer">Validar resultado por WhatsApp</a></aside></div></details>
      </div></section>

      <section className="section plans-section" id="planes"><div className="shell"><div className="section-heading reveal"><p className="eyebrow light"><span /> Paquetes de acompañamiento</p><h2>Elige cuánto deseas delegar</h2><p>Desde ordenar el expediente hasta acompañarte con diagnóstico, tramitación y seguimiento.</p></div><div className="plans-grid"><Plan name="Básico" tag="Claridad documentaria" regular="S/ 2,450" price="S/ 1,800" note="promoción · pago al contado" features={["Guía PDF especializada","Diagnóstico virtual","Documentos de gestión","Expediente para la autoridad sanitaria"]}/><Plan featured name="Completo" tag="Diagnóstico + documentos + expediente" regular="S/ 4,000" price="S/ 3,200" note="al contado · S/ 3,400 en cuotas" features={["Todo el Plan Básico","Diagnóstico técnico del local","Documentos y expediente DIRIS","Ruta personalizada de correcciones","Visita de verificación"]}/><Plan name="VIP" tag="Mayor delegación" regular="S/ 5,400" price="S/ 4,000" note="al contado · S/ 4,200 en cuotas" features={["Todo el Plan Completo","Tramitación ante DIRIS","Una visita de seguimiento","Acompañamiento operativo ampliado"]}/></div><p className="promo-note">Precios expresados en soles. Las promociones se confirman por WhatsApp y tienen vigencia de 24 horas desde la cotización.</p></div></section>

      <section className="section services-section" id="tarifas"><div className="shell"><div className="section-heading narrow reveal"><p className="eyebrow"><span /> Servicios individuales</p><h2>También puedes contratar por etapas</h2><p>Útil si ya resolviste una parte del proceso y necesitas apoyo puntual.</p></div><div className="services-list reveal">{services.map(([icon,title,regular,price,copy])=><div className="service-row" key={title}><div className="service-icon">{icon}</div><div><strong>{title}</strong><span>{copy}</span></div><p>{regular&&<del>{regular}</del>}<strong>{price}</strong>{title.startsWith("Seguimiento")&&<small>por visita</small>}</p></div>)}</div></div></section>

      <section className="section cases-section" id="casos"><div className="shell"><div className="cases-heading reveal"><div><p className="eyebrow light"><span /> Testimonios reales</p><h2>Ellos ya avanzaron hacia su categorización</h2></div><p>Conoce sus historias y abre cada testimonio en su publicación original de TikTok.</p></div><figure className="testimonial-banner reveal"><img src="./testimonios-categorizacion-dental.jpeg" alt="Profesionales de Santa Lucía, MK Dental, Soredent, Dra. Daniela, Sanar y Atracción Dental con sus resoluciones de categorización" width="1536" height="1024" loading="lazy"/><figcaption>Experiencias reales de consultorios acompañados por Categorización Dental.</figcaption></figure><div className={`case-grid ${showAll?"show-all":""}`}>{cases.map((item)=><button className="case-card" type="button" key={item[1]} onClick={()=>openVideo(item)}><img src={`./case-${item[1]}.webp`} alt={`Vista previa del testimonio de ${item[0]}`} width="576" height="1024" loading="lazy"/><span className="play-button" aria-hidden="true">▶</span><span className="case-info"><span>Ver testimonio</span><strong>{item[0]}</strong><small>{item[3]}</small></span></button>)}<button className="button button-outline show-more" type="button" onClick={()=>setShowAll(!showAll)}>{showAll?"Mostrar menos":"Ver los 13 testimonios"}</button></div></div></section>

      <section className="section process-section" id="proceso" style={{ background: "linear-gradient(90deg,#fffffffa,#fffffff0), url('./dentix-recepcion.png') center 40% / cover" }}><div className="shell"><div className="section-heading narrow reveal"><p className="eyebrow"><span /> Método de trabajo</p><h2>De la incertidumbre a una ruta clara</h2></div><ol className="process-list">{[["01","Diagnosticamos","Revisamos tu etapa, local, categoría probable y brechas principales."],["02","Definimos la ruta","Adaptamos el acompañamiento al metraje, servicios, jurisdicción y complejidad."],["03","Preparamos","Organizamos planos, documentos, expediente y correcciones necesarias."],["04","Acompañamos","Damos seguimiento dentro del alcance contratado, sin promesas automáticas."]].map(([n,t,c])=><li key={n}><span>{n}</span><div><h3>{t}</h3><p>{c}</p></div></li>)}</ol></div></section>

      <section className="section faq-section"><div className="shell faq-grid"><div className="faq-intro reveal"><p className="eyebrow"><span /> Preguntas frecuentes</p><h2>Lo que conviene saber antes de invertir</h2><p>La mejor decisión suele ocurrir antes de firmar un alquiler o iniciar una remodelación.</p><a className="text-link" href={wa("Hola, tengo una pregunta sobre la categorización de mi consultorio dental.")} target="_blank" rel="noreferrer">Hacer otra pregunta →</a></div><div className="faq-list reveal delay-1"><Faq q="¿Qué categoría corresponde a mi establecimiento?">De manera general, un consultorio odontológico puede corresponder a I-1 y un centro odontológico a I-3. La definición final requiere revisar cartera de servicios, recurso humano, organización e infraestructura.</Faq><Faq q="¿Puedo saber si un local sirve antes de alquilarlo?">Sí. Un diagnóstico previo ayuda a identificar riesgos de compatibilidad de uso, metraje, accesibilidad, servicios higiénicos, circulación y distribución.</Faq><Faq q="¿La asesoría garantiza la aprobación?">No. La decisión corresponde a la autoridad sanitaria y depende del cumplimiento real. El servicio mejora la preparación y reduce errores evitables.</Faq><Faq q="¿Atienden fuera de Lima?">Sí, existe atención nacional. La estrategia y el alcance se ajustan a la autoridad competente y a la necesidad de visitas.</Faq></div></div></section>

      <section className="final-cta"><div className="shell final-card reveal"><div><p className="eyebrow light"><span /> Da el primer paso con claridad</p><h2>Antes de invertir más, confirma qué necesitas.</h2><p>Cuéntanos tu etapa, distrito y metraje. Te orientaremos sobre la ruta más conveniente.</p></div><a className="button button-orange" href={wa("Hola, deseo evaluar mi consultorio dental. Mi distrito es: ___, mi local tiene ___ m² y actualmente estoy en la etapa de: ___.")} target="_blank" rel="noreferrer">Evaluar mi caso por WhatsApp</a></div></section>
    </main>

    <footer><div className="shell footer-grid"><a className="brand footer-brand" href="#inicio"><span><strong>Categorización</strong><small>Dental</small></span></a><p>Consultoría especializada para consultorios y centros odontológicos en Perú.</p><div><a href="#planes">Planes</a><a href="#autodiagnostico">Autodiagnóstico</a><a href="#casos">Casos</a></div><p className="legal">La información y los cálculos son orientativos. La autoridad sanitaria determina la categoría y la conformidad del establecimiento.</p></div></footer>
    <GuidedAssistant score={score} answered={answeredCount} status={readiness.label} critical={criticalFailures.map((item)=>item.short)} />
    <a className="floating-whatsapp" href={wa("Hola, deseo orientación para mi categorización dental.")} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp"><span>WhatsApp</span><strong>↗</strong></a>
    <dialog className="video-modal" ref={dialogRef} aria-labelledby="video-title" onCancel={(e)=>{e.preventDefault();closeVideo();}}><button className="modal-close" type="button" aria-label="Cerrar video" onClick={closeVideo}>×</button>{activeVideo&&<><div className="video-frame"><iframe src={`https://www.tiktok.com/player/v1/${activeVideo[1]}?music_info=1&description=1&autoplay=1`} title={`Testimonio de ${activeVideo[0]}`} allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div><div className="modal-copy"><span>Testimonio real</span><h3 id="video-title">{activeVideo[0]}</h3><a href={activeVideo[2]} target="_blank" rel="noreferrer">Abrir publicación original en TikTok ↗</a></div></>}</dialog>
  </>;
}

function Plan({name,tag,regular,price,note,features,featured=false}:{name:string;tag:string;regular:string;price:string;note:string;features:string[];featured?:boolean}) {
  return <article className={`plan-card ${featured?"featured":""}`}>{featured&&<span className="most-chosen">Recomendado</span>}<div className="plan-top"><span>{name}</span><small>{tag}</small></div><p className="old-price">Precio regular: {regular}</p><p className="price">{price}</p><p className="price-note">{note}</p><ul>{features.map(item=><li key={item}>{item}</li>)}</ul><a className={`button ${featured?"":"button-outline"}`} href={wa(`Hola, me interesa el Plan ${name} de Categorización Dental. Deseo confirmar si aplica a mi caso.`)} target="_blank" rel="noreferrer">Consultar Plan {name}</a></article>;
}

function Faq({q,children}:{q:string;children:React.ReactNode}) { return <details><summary>{q}</summary><p>{children}</p></details>; }

type ChatMessage = { role: "bot" | "user"; text: string };

function GuidedAssistant({score,answered,status,critical}:{score:number;answered:number;status:string;critical:string[]}) {
  const [open,setOpen] = useState(false);
  const [input,setInput] = useState("");
  const [messages,setMessages] = useState<ChatMessage[]>([{role:"bot",text:"Hola, soy el orientador de Categorización Dental. Puedo resolver dudas iniciales sobre el local, categorías, documentos, planes y tu preevaluación."}]);
  const quickQuestions = ["¿Mi local sirve?","¿I-1 o I-3?","¿Qué plan necesito?","Revisar mi resultado"];

  const answerFor = (question:string) => {
    const text = question.toLocaleLowerCase("es-PE").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    if (/(resultado|porcentaje|evaluacion|cumplimiento)/.test(text)) {
      if (answered < readinessItems.length) return `Has respondido ${answered} de ${readinessItems.length} criterios. Completa las ${readinessItems.length} preguntas para obtener una lectura más útil; tu avance estimado actual es ${score}%.`;
      const alerts = critical.length ? ` Prioriza: ${critical.slice(0,3).join(", ")}.` : " No declaraste alertas críticas en esta muestra.";
      return `Tu resultado actual es ${score}% y el estado es “${status}”.${alerts} Es una orientación; debe validarse con el instrumento completo.`;
    }
    if (/(local|alquil|inmueble|sirve|remodel)/.test(text)) return "Antes de alquilar o remodelar conviene verificar compatibilidad de uso, metraje, ancho, accesibilidad, servicios higiénicos, ventilación, instalaciones y posibilidad de separar los flujos clínicos.";
    if (/(i-?1|i-?3|categoria|consultorio|centro)/.test(text)) return "Como referencia inicial, un consultorio odontológico suele evaluarse como I-1 y un centro odontológico como I-3. La categoría final depende de la cartera de servicios, personal, organización, infraestructura y criterio de la autoridad sanitaria.";
    if (/(plan|precio|cuesta|tarifa|presupuesto)/.test(text)) return "El Plan Básico parte de S/ 1,800, el Completo de S/ 3,200 y el VIP de S/ 4,000 al contado. Tu etapa, las brechas críticas y el nivel de acompañamiento ayudan a decidir cuál conviene.";
    if (/(document|expediente|diris|gestion)/.test(text)) return "La preparación suele incluir documentos de gestión, formatos de historia clínica y odontograma, legajos del personal, responsable técnico, bioseguridad, esterilización y manejo de residuos. El alcance exacto se confirma según tu jurisdicción.";
    if (/(esteril|bioseg|residuo|seguridad)/.test(text)) return "Revisa el flujo unidireccional de esterilización, los controles del equipo, la segregación de residuos y el contrato con un operador autorizado.";
    if (/(hola|buenos|buenas|ayuda)/.test(text)) return "¡Hola! Puedes preguntarme si tu local parece viable, qué diferencia hay entre I-1 e I-3, qué documentos revisar o qué plan podría convenirte.";
    return "Puedo darte una orientación inicial, pero esa pregunta requiere revisar tu caso. Escribe tu distrito, metraje, número de sillones y etapa del proyecto; también puedes enviarlo por WhatsApp para una respuesta personalizada.";
  };

  const send = (question:string) => {
    const clean = question.trim();
    if (!clean) return;
    setMessages((current)=>[...current,{role:"user",text:clean},{role:"bot",text:answerFor(clean)}]);
    setInput("");
  };

  return <div className={`chat-widget ${open?"is-open":""}`}>
    {open&&<section className="chat-panel" aria-label="Orientador de categorización dental"><header><div className="chat-avatar">CD</div><div><strong>Orientador dental</strong><span><i /> Respuesta inmediata</span></div><button type="button" aria-label="Cerrar asistente" onClick={()=>setOpen(false)}>×</button></header><div className="chat-disclaimer">Orientación inicial · no reemplaza evaluación técnica</div><div className="chat-messages" aria-live="polite">{messages.map((message,index)=><p key={`${message.role}-${index}`} className={message.role}>{message.text}</p>)}</div><div className="quick-questions">{quickQuestions.map((question)=><button type="button" key={question} onClick={()=>send(question)}>{question}</button>)}</div><form onSubmit={(event)=>{event.preventDefault();send(input);}}><label className="sr-only" htmlFor="chat-question">Escribe tu pregunta</label><input id="chat-question" value={input} onChange={(event)=>setInput(event.target.value)} placeholder="Escribe tu pregunta…" autoComplete="off"/><button type="submit" aria-label="Enviar pregunta">→</button></form><a href={wa("Hola, necesito orientación personalizada sobre la categorización de mi establecimiento dental.")} target="_blank" rel="noreferrer">Pasar con un especialista por WhatsApp</a></section>}
    <button className="chat-launcher" type="button" aria-expanded={open} onClick={()=>setOpen(!open)}><span>{open?"×":"?"}</span><strong>{open?"Cerrar":"Pregúntanos"}</strong></button>
  </div>;
}
