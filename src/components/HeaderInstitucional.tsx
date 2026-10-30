import type { CSSProperties } from "react";

export default function HeaderInstitucional({ className = "" }: { className?: string }) {
  return (
    <header
      className={`w-full border-b border-neutral-700 px-6 py-6 ${className}`}
      style={{ fontFamily: "var(--font-cinzel)" } as CSSProperties}
    >
      <div className="flex w-full items-center justify-between gap-4">
        <img
          src="/images/logo-u.webp"
          alt="UNCP"
          className="h-36 shrink-0 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        />
        <div className="min-w-0 flex-1 text-center">
          <div
            className="whitespace-nowrap text-3xl font-black uppercase text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
            style={{ letterSpacing: "0.35em" }}
          >
            UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ
          </div>
          <div
            className="mt-2 whitespace-nowrap text-3xl font-bold uppercase text-neutral-300 drop-shadow-[0_1px_8px_rgba(255,255,255,0.15)]"
            style={{ letterSpacing: "0.3em" }}
          >
            Vicerrectorado Académico
          </div>
          <div
            className="mt-1 whitespace-nowrap text-3xl font-bold uppercase text-neutral-200 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
            style={{ letterSpacing: "0.25em" }}
          >
            Dirección de Proyección Social y Extensión Cultural
          </div>
        </div>
        <img
          src="/images/logo-direccion.webp"
          alt="DPSEC"
          className="h-44 shrink-0 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        />
      </div>
    </header>
  );
}
