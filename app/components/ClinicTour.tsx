"use client";
import { useRef, type FormEvent, type ReactNode } from "react";

export default function ClinicTour({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  function consult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = `Hola, Categorización Dental. Deseo consultar por el Diagnóstico con IA de S/ 100.\nNombre: ${String(data.get("nombre")).trim()}\nConsultorio: ${String(data.get("consultorio")).trim()}\nCiudad o distrito: ${String(data.get("ciudad")).trim()}\nMi consulta: ${String(data.get("consulta")).trim() || "Quiero conocer qué me falta para categorizar mi consultorio."}`;
    window.open(`https://wa.me/51963417926?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }
  return <section className="aerial-hero" aria-label="Vista aérea del consultorio y diagnóstico con IA">
    <div className="aerial-copy">
      {children}
      <a href="#autodiagnostico" className="express-hero-cta">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6M8 10l1.5 1.5L12 9M13 14h3M8 15l1.5 1.5L12 14"/></svg>
        <span>Haz tu Diagnóstico Express <strong>GRATIS</strong><small>Descubre qué te falta · Solo 3 minutos</small></span>
      </a>
      <button className="button aerial-cta" type="button" onClick={() => dialog.current?.showModal()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1"/><rect x="7" y="7" width="10" height="10" rx="3"/><path d="m10 13 2-3 2 3m-3.5-1h3"/></svg>
        <span>Diagnóstico con IA <strong>S/ 100</strong><small>Consultar por WhatsApp</small></span>
      </button>
      <p className="aerial-disclaimer">Evaluación preliminar. No sustituye la evaluación profesional ni certifica el cumplimiento normativo.</p>
    </div>
    <div className="aerial-visual">
      <div className="aerial-view-title"><span>CONSULTORIO IDEAL · REFERENCIA MINSA</span><span>¿TU CONSULTORIO TIENE TODO LO NECESARIO?</span></div>
      <iframe src="./consultorio-aereo/index.html?v=2" title="Recorrido aéreo interactivo del consultorio dental" className="aerial-frame" />
      <p className="aerial-hint">Acerca con la rueda o con dos dedos · Arrastra para moverte <span>Modelo ilustrativo · Solo vista aérea, sin recorrido interior</span></p>
    </div>
    <dialog ref={dialog} className="ai-consult-dialog" onClick={event => {if(event.target===event.currentTarget)dialog.current?.close()}}>
      <button className="ai-dialog-close" type="button" aria-label="Cerrar consulta" onClick={() => dialog.current?.close()}>×</button>
      <p className="eyebrow">CONSULTA POR WHATSAPP</p>
      <h2>Diagnóstico con IA</h2><p className="ai-price">S/ 100</p>
      <p>Ficha de infraestructura y checklist de equipamiento, documentos y personal. Completa tus datos para consultar el servicio.</p>
      <form onSubmit={consult}>
        <label>Tu nombre<input name="nombre" autoComplete="name" maxLength={100} required /></label>
        <label>Nombre del consultorio<input name="consultorio" autoComplete="organization" maxLength={120} required /></label>
        <label>Ciudad o distrito<input name="ciudad" maxLength={120} required /></label>
        <label>¿Qué necesitas consultar? <span>(opcional)</span><textarea name="consulta" rows={3} maxLength={800} /></label>
        <p className="ai-data-note">Los datos no se guardan aquí. Se abrirá WhatsApp con tu mensaje preparado; tú decides si lo envías.</p>
        <button className="button ai-whatsapp-submit" type="submit">Continuar por WhatsApp · S/ 100</button>
      </form>
      <small>Diagnóstico preliminar con IA; no sustituye la evaluación profesional. La aprobación corresponde a la autoridad sanitaria.</small>
    </dialog>
  </section>;
}
