export default function HeaderInstitucional({ className = "" }: { className?: string }) {
  return (
    <header
      className={`flex w-full shrink-0 items-center justify-between gap-2 border-b border-neutral-700 px-4 py-3 ${className}`}
    >
      <img
        src="/images/logo-u.webp"
        alt="UNCP"
        className="w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        style={{ height: "clamp(3rem, 12vh, 9rem)" }}
      />

      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden text-center">
        <div
          className="whitespace-nowrap font-black uppercase text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
          style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.65rem, 1.8vw, 1.9rem)", letterSpacing: "0.3em" }}
        >
          UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ
        </div>
        <div
          className="whitespace-nowrap font-bold uppercase text-neutral-300 drop-shadow-[0_1px_8px_rgba(255,255,255,0.15)]"
          style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.6rem, 1.5vw, 1.6rem)", letterSpacing: "0.28em" }}
        >
          Vicerrectorado Académico
        </div>
        <div
          className="whitespace-nowrap font-bold uppercase text-neutral-200 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
          style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.65rem, 1.7vw, 1.8rem)", letterSpacing: "0.2em" }}
        >
          Dirección de Proyección Social y Extensión Cultural
        </div>
      </div>

      <img
        src="/images/logo-direccion.webp"
        alt="DPSEC"
        className="w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        style={{ height: "clamp(3rem, 14vh, 11rem)" }}
      />
    </header>
  );
}
