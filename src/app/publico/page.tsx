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

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const todos = activo ? completo(puntajes, activo.id) : false;
  const total = activo ? totalDe(puntajes, activo.id) : 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white">
      {/* Encabezado institucional */}
      <header className="w-full border-b border-neutral-700 px-6 py-6">
        <div className="flex w-full items-center justify-between gap-4">
          <img src="/images/logo-u.webp" alt="UNCP" className="h-36 shrink-0 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" />
          <div className="min-w-0 flex-1 text-center">
            <div
              className="whitespace-nowrap text-3xl font-black uppercase text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
              style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.35em" }}
            >
              UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ
            </div>
            <div
              className="mt-2 whitespace-nowrap text-3xl font-bold uppercase text-neutral-300 drop-shadow-[0_1px_8px_rgba(255,255,255,0.15)]"
              style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.3em" }}
            >
              Vicerrectorado Académico
            </div>
            <div
              className="mt-1 whitespace-nowrap text-3xl font-bold uppercase tracking-wide text-neutral-200 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Dirección de Proyección Social y Extensión Cultural
            </div>
          </div>
          <img src="/images/logo-direccion.webp" alt="DPSEC" className="h-44 shrink-0 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" />
        </div>
      </header>

      {/* Título principal */}
      <div className="px-12 py-10 text-center">
        <h1 className="text-7xl font-black uppercase tracking-wider text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          FESTIDANZA UNCP 2026
        </h1>
        <p className="mt-4 text-3xl font-bold uppercase tracking-wide text-neutral-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Calificaciones · Administrativos y Docentes
        </p>
      </div>

      {/* Tarjetas horizontales - 5 en una fila */}
      <main className="flex flex-1 items-start justify-center px-8 py-4">
        <div className="grid w-full max-w-[1800px] grid-cols-5 gap-6">
          {/* Tarjeta 1: Participante */}
          <div className="flex flex-col items-center justify-between rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 shadow-2xl">
            <div className="mb-4 flex items-center gap-2 text-neutral-500">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-semibold uppercase tracking-wider">Participante</span>
            </div>

            {activo?.logo_url ? (
              <div className="mb-6 flex h-64 w-64 items-center justify-center rounded-full bg-neutral-700 p-4">
                <img
                  src={activo.logo_url}
                  alt={activo.nombre}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="mb-6 flex h-64 w-64 items-center justify-center rounded-full border-2 border-neutral-800 bg-neutral-700">
                <svg className="h-32 w-32 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {activo && (
              <>
                <h2 className="text-center text-xl font-bold leading-tight text-white">{activo.nombre}</h2>
                <p className="mt-2 text-sm uppercase tracking-wide text-neutral-500">
                  {activo.tipo === "docente" ? "Docente" : "Administrativo"}
                </p>
              </>
            )}
          </div>

          {/* Tarjetas 2-4: Jurados */}
          {[1, 2, 3].map((j) => {
            const valor = activo ? puntajeDe(puntajes, activo.id, j) : undefined;
            return (
              <div
                key={j}
                className="flex flex-col items-center justify-between rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 shadow-2xl"
              >
                <div className="mb-4 flex items-center gap-2 text-neutral-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-sm font-semibold uppercase tracking-wider">Jurado {j}</span>
                </div>

                <div className="flex flex-1 items-center justify-center">
                  {valor !== undefined ? (
                    <p className="text-9xl font-black text-white">{valor}</p>
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center">
                      <span className="text-8xl font-bold text-neutral-800">—</span>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-xs uppercase tracking-widest text-neutral-600">
                  {valor !== undefined ? "puntos obtenidos" : "pendiente"}
                </p>
              </div>
            );
          })}

          {/* Tarjeta 5: Total — verde oscuro vacío, verde claro al llenarse */}
          <div
            className="flex flex-col items-center justify-between rounded-2xl border-2 p-8 shadow-2xl"
            style={{
              background: todos
                ? "linear-gradient(to bottom, #166534, #14532d)"
                : "linear-gradient(to bottom, #1a4a35, #0f2e20)",
              borderColor: todos ? "#16a34a" : "#14532d",
            }}
          >
            <div className={`mb-4 flex items-center gap-2 ${todos ? "text-green-200" : "text-emerald-300"}`}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold uppercase tracking-wider">Puntaje total</span>
            </div>

            <div className="flex flex-1 items-center justify-center">
              {todos ? (
                <p className="text-9xl font-black text-white drop-shadow-2xl">{total}</p>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center">
                  <span className="text-8xl font-bold text-neutral-800">—</span>
                </div>
              )}
            </div>

            <p className={`mt-4 text-xs font-semibold uppercase tracking-widest ${todos ? "text-green-200" : "text-emerald-400"}`}>
              {todos ? "Resultado acumulado" : "Esperando calificación"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
