"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const views = [
  { src: "./dentix-consultorio.png", title: "Dentro del consultorio", detail: "Un espacio pensado para atender.", position: "50% 55%" },
  { src: "./dentix-recepcion.png", title: "La primera impresión", detail: "Recepción y bienvenida.", position: "50% 46%" },
  { src: "./dentix-clinica.png", title: "Otra perspectiva", detail: "Recorre el ambiente clínico.", position: "50% 48%" },
  { src: "./modelo-consultorio.jpeg", title: "El corazón de la atención", detail: "Unidad dental y área de trabajo.", position: "50% 50%" },
  { src: "./modelo-esterilizacion.jpeg", title: "Cada ambiente cuenta", detail: "Organización del área de esterilización.", position: "50% 50%" },
  { src: "./modelo-distribucion.jpeg", title: "Mira el conjunto", detail: "Una visión completa de los ambientes.", position: "50% 50%" },
];
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function ClinicTour({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const desired = useRef(0);
  const activeRef = useRef(0);
  const playingRef = useRef(false);
  const drag = useRef<{ id: number; x: number; start: number } | null>(null);
  const zoomRef = useRef(1);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [zoom, setZoom] = useState(1);
  const seekRef = useRef<(value: number) => void>(() => {});

  useEffect(() => {
    const root = section.current;
    const screen = stage.current;
    if (!root || !screen) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frames = Array.from(screen.querySelectorAll<HTMLElement>(".tour-frame"));
    const meter = screen.querySelector<HTMLInputElement>(".tour-scrub");
    let reduce = media.matches;
    let visible = true;
    let raf = 0;
    let last = 0;
    let idle = 0;
    let start = 0;
    let distance = 1;
    let cursor = { x: 0, y: 0 };
    let camera = { x: 0, y: 0 };
    let previousScroll = window.scrollY;
    setReduced(reduce);
    const measure = () => {
      const top = parseFloat(getComputedStyle(screen).top) || 0;
      start = root.getBoundingClientRect().top + window.scrollY - top;
      distance = Math.max(1, root.offsetHeight - screen.offsetHeight);
    };
    const render = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(50, now - (last || now));
      last = now;
      if (playingRef.current) {
        desired.current = clamp(desired.current + dt / 30000);
        if (desired.current >= 1) { playingRef.current = false; setPlaying(false); }
      }
      progress.current = reduce ? desired.current : progress.current + (desired.current - progress.current) * (1 - Math.exp(-dt / 100));
      if (Math.abs(progress.current - desired.current) < .0001) progress.current = desired.current;
      const p = progress.current;
      const position = p * (views.length - 1);
      const selected = Math.round(position);
      if (selected !== activeRef.current) { activeRef.current = selected; setActive(selected); }
      idle += dt;
      camera.x += (cursor.x - camera.x) * .08;
      camera.y += (cursor.y - camera.y) * .08;
      const drift = reduce ? 0 : Math.sin(idle / 4200) * .018;
      frames.forEach((frame, i) => {
        const offset = position - i;
        const opacity = clamp((.7 - Math.abs(offset)) / .4);
        frame.style.opacity = String(opacity);
        frame.style.visibility = opacity > .001 ? "visible" : "hidden";
        if (opacity <= .001) return;
        const scale = reduce ? zoomRef.current : (1.07 + Math.sin(p * Math.PI * 3) * .055 + Math.abs(offset) * .16 + drift) * zoomRef.current;
        frame.style.transform = reduce ? `scale(${scale})` : `perspective(1400px) translate3d(${offset * -7 + camera.x * 2}%,${camera.y * 1.6}%,0) rotateY(${offset * 13 + camera.x * 5}deg) rotateX(${-camera.y * 3}deg) scale(${scale})`;
        frame.style.zIndex = String(10 - Math.round(Math.abs(offset) * 5));
      });
      root.style.setProperty("--tour-progress", String(p));
      root.style.setProperty("--tour-intro", String(clamp(1 - p * 7)));
      root.style.setProperty("--tour-expand", String(clamp(p * 6)));
      if (meter && document.activeElement !== meter) meter.value = String(Math.round(p * 1000));
      if (!reduce || playingRef.current || progress.current !== desired.current) raf = requestAnimationFrame(render);
    };
    const wake = () => { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(render); } };
    const stopPlaying = () => { if (playingRef.current) { playingRef.current = false; setPlaying(false); } };
    const scroll = () => {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - previousScroll) > 1) {
        stopPlaying();
        desired.current = clamp((scrollY - start) / distance);
      }
      previousScroll = scrollY;
      wake();
    };
    const resize = () => { measure(); wake(); };
    const move = (event: PointerEvent) => {
      if (reduce || event.pointerType === "touch") return;
      const rect = screen.getBoundingClientRect();
      cursor = { x: clamp((event.clientX - rect.left) / rect.width) * 2 - 1, y: clamp((event.clientY - rect.top) / rect.height) * 2 - 1 };
      wake();
    };
    const leave = () => { cursor = { x: 0, y: 0 }; };
    const motionChange = () => { reduce = media.matches; setReduced(reduce); if (reduce) stopPlaying(); wake(); };
    const visibilityChange = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else wake(); };
    seekRef.current = (p) => { desired.current = clamp(p); wake(); };
    measure();
    desired.current = clamp((window.scrollY - start) / distance);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else { cancelAnimationFrame(raf); raf = 0; stopPlaying(); } }, { threshold: 0 });
    observer.observe(screen);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    screen.addEventListener("pointermove", move, { passive: true });
    screen.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibilityChange);
    media.addEventListener("change", motionChange);
    wake();
    return () => {
      cancelAnimationFrame(raf); observer.disconnect(); resizeObserver.disconnect();
      window.removeEventListener("scroll", scroll); window.removeEventListener("resize", resize);
      screen.removeEventListener("pointermove", move); screen.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibilityChange); media.removeEventListener("change", motionChange);
      seekRef.current = () => {};
    };
  }, []);

  const seek = (p: number) => { playingRef.current = false; setPlaying(false); seekRef.current(p); };
  const play = () => {
    const next = !playingRef.current;
    playingRef.current = next; setPlaying(next);
    if (next && desired.current > .99) desired.current = 0;
    seekRef.current(desired.current);
  };
  const changeZoom = (value: number) => { zoomRef.current = clamp(value, 1, 1.4); setZoom(zoomRef.current); seekRef.current(desired.current); };

  return <section className={`clinic-tour ${reduced ? "tour-reduced" : ""}`} ref={section} aria-label="Recorrido visual de consultorios" style={{ "--tour-progress": 0, "--tour-intro": 1, "--tour-expand": 0 } as CSSProperties}>
    <div className="tour-sticky" ref={stage}>
      <div className="tour-room-label"><span>EXPLORA LOS AMBIENTES</span><a href="#autodiagnostico">Ir al autodiagnóstico ↗</a></div>
      <div className="tour-canvas" role="group" aria-label="Vistas del consultorio. Arrastra horizontalmente para cambiar la perspectiva." onPointerDown={(event) => {
        if (event.button !== 0) return;
        drag.current = { id: event.pointerId, x: event.clientX, start: desired.current };
        event.currentTarget.setPointerCapture(event.pointerId);
        playingRef.current = false; setPlaying(false);
      }} onPointerMove={(event) => {
        if (!drag.current || drag.current.id !== event.pointerId) return;
        const width = event.currentTarget.clientWidth;
        seekRef.current(drag.current.start + (drag.current.x - event.clientX) / Math.max(240, width) * .4);
      }} onPointerUp={(event) => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { drag.current = null; }}>
        {views.map((view, index) => <div className="tour-frame" key={view.src} style={{ opacity: index === 0 ? 1 : 0, visibility: index === 0 ? "visible" : "hidden" }}>
          <img src={view.src} alt={`Render: ${view.title}`} width="1200" height="1500" draggable={false} fetchPriority={index === 0 ? "high" : "auto"} decoding="async" style={{ objectPosition: view.position }} />
        </div>)}
        <div className="tour-vignette" />
      </div>
      <div className="tour-intro" inert={active !== 0} aria-hidden={active !== 0}>{children}</div>
      <div className="tour-caption" aria-live="off"><span>{String(active + 1).padStart(2, "0")} / {String(views.length).padStart(2, "0")}</span><h2>{views[active].title}</h2><p>{views[active].detail}</p></div>
      <div className="tour-controls">
        <div className="tour-control-top"><button type="button" className="tour-play" onClick={play} aria-label={playing ? "Pausar recorrido" : "Reproducir recorrido"}>{playing ? "Ⅱ Pausar" : "▶ Reproducir"}</button><span className="tour-instruction">Baja para recorrer · arrastra para explorar</span><div className="tour-zoom"><button type="button" onClick={() => changeZoom(zoom - .1)} aria-label="Alejar vista" disabled={zoom <= 1}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" onClick={() => changeZoom(zoom + .1)} aria-label="Acercar vista" disabled={zoom >= 1.4}>+</button></div></div>
        <input className="tour-scrub" type="range" min="0" max="1000" defaultValue="0" aria-label="Avance del recorrido" onChange={(event) => seek(Number(event.target.value) / 1000)} />
        <div className="tour-scenes" aria-label="Seleccionar ambiente">{views.map((view, index) => <button type="button" key={view.src} aria-label={`Ver ${view.title}`} aria-pressed={active === index} onClick={() => seek(index / (views.length - 1))}><img src={view.src} alt="" loading="lazy"/><span>{String(index + 1).padStart(2, "0")}</span></button>)}</div>
        <small className="tour-credit">Recorrido animado a partir de renders de referencia</small>
      </div>
    </div>
  </section>;
}
