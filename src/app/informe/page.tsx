"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  puntajeDe,
  ranking,
  totalDe,
  type Participante,
  type Puntaje,
  type Tipo,
} from "@/lib/concurso";

export default function InformePage() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [puntajes, setPuntajes] = useState<Puntaje[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("participantes").select("*"),
      supabase.from("puntajes").select("participante_id, jurado, puntaje"),
    ]).then(([pa, pu]) => {
      setParticipantes((pa.data ?? []) as Participante[]);
      setPuntajes((pu.data ?? []) as Puntaje[]);
      setCargando(false);
    });
  }, []);

  if (cargando) return <p className="p-8">Cargando informe…</p>;

  const cerrados = participantes
    .filter((p) => p.estado === "finalizado" || p.estado === "no_se_presento")
    .sort((a, b) => (a.finalizado_at ?? "").localeCompare(b.finalizado_at ?? ""));

  const top = (tipo: Tipo) =>
    ranking(
      cerrados
        .filter((p) => p.estado === "finalizado" && p.tipo === tipo)
        .map((p) => ({ p, total: totalDe(puntajes, p.id) }))
    ).filter((x) => x.puesto <= 3);

  const topDocentes = top("docente");
  const topAdministrativos = top("administrativo");

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 0; }

          /* El encabezado queda fijo en la parte superior de cada hoja */
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 8mm 12mm 4mm 12mm;
            background: white;
            border-bottom: 1px solid #000;
          }

          /* El cuerpo tiene padding-top igual a la altura del encabezado fijo */
          .print-body {
            padding-top: 42mm;
            padding-left: 12mm;
            padding-right: 12mm;
            padding-bottom: 10mm;
          }

          /* Ocultar botón de imprimir */
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Encabezado — visible en pantalla y fijo en impresión */}
      <header className="print-header flex items-center justify-between gap-4 border-b border-black pb-3 mb-4 px-8 pt-4">
        <img src="/images/logo-u.webp" alt="UNCP" className="h-16 object-contain" />
        <div className="text-center text-xs font-semibold leading-relaxed">
          <p>UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ</p>
          <p>VICERRECTORADO ACADÉMICO</p>
          <p>DIRECCIÓN DE PROYECCIÓN SOCIAL Y EXTENSIÓN CULTURAL</p>
        </div>
        <img src="/images/logo-direccion.webp" alt="DPSEC" className="h-16 object-contain" />
      </header>

      {/* Contenido principal */}
      <main className="print-body mx-auto max-w-4xl bg-white px-8 pb-8 text-sm text-black">
        <button
          onClick={() => window.print()}
          className="no-print mb-6 rounded bg-gray-900 px-4 py-2 text-white"
        >
          Imprimir / Guardar como PDF
        </button>

        <h1 className="mb-4 text-center text-lg font-bold">Festidanza 2026 — Informe de calificación</h1>

        {/* Parte 1: lista en orden de calificación */}
        <h2 className="mb-2 font-semibold">1. Orden de calificación</h2>
        <table className="mb-8 w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="p-1">N°</th>
              <th className="p-1">Participante</th>
              <th className="p-1">Tipo</th>
              <th className="p-1 text-center">Jurado 1</th>
              <th className="p-1 text-center">Jurado 2</th>
              <th className="p-1 text-center">Jurado 3</th>
              <th className="p-1 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {cerrados.map((p, i) =>
              p.estado === "no_se_presento" ? (
                <tr key={p.id} className="border-b">
                  <td className="p-1">{i + 1}</td>
                  <td className="p-1">{p.nombre}</td>
                  <td className="p-1">{p.tipo === "docente" ? "Docente" : "Administrativo"}</td>
                  <td colSpan={4} className="p-1 text-center italic">No se presentó</td>
                </tr>
              ) : (
                <tr key={p.id} className="border-b">
                  <td className="p-1">{i + 1}</td>
                  <td className="p-1">{p.nombre}</td>
                  <td className="p-1">{p.tipo === "docente" ? "Docente" : "Administrativo"}</td>
                  <td className="p-1 text-center">{puntajeDe(puntajes, p.id, 1)}</td>
                  <td className="p-1 text-center">{puntajeDe(puntajes, p.id, 2)}</td>
                  <td className="p-1 text-center">{puntajeDe(puntajes, p.id, 3)}</td>
                  <td className="p-1 text-center font-bold">{totalDe(puntajes, p.id)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* Parte 2: top 3 */}
        <div className="break-before-page space-y-8">
          <h2 className="font-semibold">2. Resultados más altos</h2>

          <div>
            <h3 className="mb-2 font-semibold">Docentes</h3>
            <TablaTop filas={topDocentes} />
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Administrativos</h3>
            <TablaTop filas={topAdministrativos} />
          </div>
        </div>
      </main>
    </>
  );
}

function TablaTop({
  filas,
}: {
  filas: { p: Participante; total: number; puesto: number }[];
}) {
  if (filas.length === 0) return <p className="italic">Sin participantes calificados.</p>;

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b-2 border-black">
          <th className="p-1">Puesto</th>
          <th className="p-1">Participante</th>
          <th className="p-1 text-center">Total</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((f) => (
          <tr key={f.p.id} className="border-b">
            <td className="p-1 font-bold">{f.puesto}</td>
            <td className="p-1">{f.p.nombre}</td>
            <td className="p-1 text-center font-bold">{f.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
