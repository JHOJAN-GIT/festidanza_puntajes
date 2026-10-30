"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { completo, puntajeDe, totalDe, type Participante, type Puntaje } from "@/lib/concurso";

export default function PublicoPage() {
  const [activo, setActivo] = useState<Participante | null>(null);
  const [puntajes, setPuntajes] = useState<Puntaje[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function cargar() {
      const { data: ev } = await supabase
        .from("evento")
        .select("estado, participante_activo_id")
        .eq("id", 1)
        .single();

      if (ev?.estado === "activo" && ev.participante_activo_id) {
        const [pa, pu] = await Promise.all([
          supabase.from("participantes").select("*").eq("id", ev.participante_activo_id).single(),
          supabase
            .from("puntajes")
            .select("participante_id, jurado, puntaje")
            .eq("participante_id", ev.participante_activo_id),
        ]);
        setActivo((pa.data ?? null) as Participante | null);
        setPuntajes((pu.data ?? []) as Puntaje[]);
      } else {
        setActivo(null);
        setPuntajes([]);
      }
    }

    cargar();

    const canal = supabase
      .channel("pantalla-publica")
      .on("postgres_changes", { event: "*", schema: "public", table: "evento" }, cargar)
      .on("postgres_changes", { event: "*", schema: "public", table: "puntajes" }, cargar)
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, []);

  const todos = activo ? completo(puntajes, activo.id) : false;
  const total = activo ? totalDe(puntajes, activo.id) : 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white">

      {/* ── ENCABEZADO ── se encoge si hace falta */}
      <header className="flex w-full shrink-0 items-center justify-between gap-2 border-b border-neutral-700 px-4 py-3">

        <img src="/images/logo-u.webp" alt="UNCP"
          className="w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          style={{ height: "clamp(3rem, 12vh, 9rem)" }} />

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-center overflow-hidden">
          <div className="whitespace-nowrap font-black uppercase text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
            style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.65rem, 1.8vw, 1.9rem)", letterSpacing: "0.3em" }}>
            UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ
          </div>
          <div className="whitespace-nowrap font-bold uppercase text-neutral-300 drop-shadow-[0_1px_8px_rgba(255,255,255,0.15)]"
            style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.6rem, 1.5vw, 1.6rem)", letterSpacing: "0.28em" }}>
            Vicerrectorado Académico
          </div>
          <div className="whitespace-nowrap font-bold uppercase text-neutral-200 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
            style={{ fontFamily: "var(--font-cinzel)", fontSize: "clamp(0.65rem, 1.7vw, 1.8rem)", letterSpacing: "0.2em" }}>
            Dirección de Proyección Social y Extensión Cultural
          </div>
        </div>

        <img src="/images/logo-direccion.webp" alt="DPSEC"
          className="w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          style={{ height: "clamp(3rem, 14vh, 11rem)" }} />
      </header>

      {/* ── TÍTULO ── tamaño natural, no fijo */}
      <div className="shrink-0 py-3 text-center">
        <h1 className="font-black uppercase text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          style={{ fontSize: "clamp(1.8rem, 4.5vw, 4.5rem)", letterSpacing: "0.08em" }}>
          FESTIDANZA UNCP 2026
        </h1>
        <p className="font-bold uppercase text-neutral-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          style={{ fontSize: "clamp(0.85rem, 1.8vw, 1.6rem)", letterSpacing: "0.12em", marginTop: "0.3em" }}>
          Calificaciones · Administrativos y Docentes
        </p>
      </div>

      {/* ── TARJETAS ── ocupa el resto (~63%) */}
      <main className="flex min-h-0 flex-1 items-stretch px-4 pb-4 gap-4">

        {/* Tarjeta Participante */}
        <div className="flex flex-1 flex-col items-center justify-between rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 text-neutral-500">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider">Participante</span>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center py-2">
            {activo?.logo_url ? (
              <div className="flex h-full w-full max-h-40 max-w-40 items-center justify-center rounded-full bg-neutral-700 p-3">
                <img src={activo.logo_url} alt={activo.nombre} className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-neutral-800 bg-neutral-700">
                <svg className="h-16 w-16 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {activo && (
            <div className="text-center">
              <h2 className="font-bold leading-tight text-white" style={{ fontSize: "clamp(0.75rem, 1.2vw, 1.1rem)" }}>{activo.nombre}</h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                {activo.tipo === "docente" ? "Docente" : "Administrativo"}
              </p>
            </div>
          )}
        </div>

        {/* Tarjetas Jurados */}
        {[1, 2, 3].map((j) => {
          const valor = activo ? puntajeDe(puntajes, activo.id, j) : undefined;
          return (
            <div key={j}
              className="flex flex-1 flex-col items-center justify-between rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 text-neutral-500">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider">Jurado {j}</span>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center">
                {valor !== undefined ? (
                  <p className="font-black text-white leading-none" style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}>{valor}</p>
                ) : (
                  <span className="font-bold text-neutral-800" style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}>—</span>
                )}
              </div>

              <p className="text-xs uppercase tracking-widest text-neutral-600">
                {valor !== undefined ? "puntos obtenidos" : "pendiente"}
              </p>
            </div>
          );
        })}

        {/* Tarjeta Total */}
        <div className="flex flex-1 flex-col items-center justify-between rounded-2xl border-2 p-4 shadow-2xl overflow-hidden"
          style={{
            background: todos ? "linear-gradient(to bottom, #166534, #14532d)" : "linear-gradient(to bottom, #1a4a35, #0f2e20)",
            borderColor: todos ? "#16a34a" : "#14532d",
          }}>
          <div className={`flex items-center gap-2 ${todos ? "text-green-200" : "text-emerald-300"}`}>
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Puntaje total</span>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center">
            {todos ? (
              <p className="font-black text-white drop-shadow-2xl leading-none" style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}>{total}</p>
            ) : (
              <span className="font-bold text-neutral-800" style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}>—</span>
            )}
          </div>

          <p className={`text-xs font-semibold uppercase tracking-widest ${todos ? "text-green-200" : "text-emerald-400"}`}>
            {todos ? "Resultado acumulado" : "Esperando calificación"}
          </p>
        </div>

      </main>
    </div>
  );
}
