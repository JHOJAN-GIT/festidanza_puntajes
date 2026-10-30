"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  completo,
  opcionesBoton,
  puntajeDe,
  totalDe,
  type Estado,
  type Evento,
  type Participante,
  type Puntaje,
  type Tipo,
} from "@/lib/concurso";
import { PRECARGADOS, logoDe } from "@/lib/participantes-precargados";
import HeaderInstitucional from "@/components/HeaderInstitucional";

const ETIQUETA: Record<Estado, string> = {
  pendiente: "Pendiente",
  en_calificacion: "En calificación",
  calificado: "Calificado",
  finalizado: "Finalizado",
  no_se_presento: "No se presentó",
};

export default function AdminPanel() {
  const router = useRouter();
  const supabase = createClient();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [puntajes, setPuntajes] = useState<Puntaje[]>([]);
  const [mensaje, setMensaje] = useState("");

  // Inicio de evento
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [rango, setRango] = useState<"10-100" | "100-1000">("10-100");
  const [modalidad, setModalidad] = useState<"precargada" | "manual">("precargada");

  // Carga manual
  const [nuevo, setNuevo] = useState({ nombre: "", tipo: "docente" as Tipo, logo_url: "" });

  // Calificación
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [valorLibre, setValorLibre] = useState("");

  async function cargar() {
    const [ev, pa, pu] = await Promise.all([
      supabase.from("evento").select("*").eq("id", 1).single(),
      supabase.from("participantes").select("*").order("orden", { ascending: true }),
      supabase.from("puntajes").select("participante_id, jurado, puntaje"),
    ]);
    if (ev.data) setEvento(ev.data as Evento);
    setParticipantes((pa.data ?? []) as Participante[]);
    setPuntajes((pu.data ?? []) as Puntaje[]);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Datos derivados
  const activo = participantes.find((p) => p.id === evento?.participante_activo_id) ?? null;
  const puntajesActivo = activo ? puntajes.filter((p) => p.participante_id === activo.id) : [];
  const juradoSiguiente = [1, 2, 3].find((j) => puntajeDe(puntajes, activo?.id ?? "", j) === undefined);
  const todosCalificados = !!activo && completo(puntajes, activo.id);
  const hayPuntajes = puntajesActivo.length > 0;
  const puedeFinalizar =
    !!activo && (activo.estado === "calificado" || activo.estado === "no_se_presento");
  const todosListos =
    participantes.length > 0 &&
    participantes.every((p) => p.estado === "finalizado" || p.estado === "no_se_presento");
  const opciones = evento ? opcionesBoton(evento) : [];
  const total = activo ? totalDe(puntajes, activo.id) : 0;
  const enCurso = evento?.estado === "activo" || evento?.estado === "cargando";

  // Evento
  async function iniciarEvento() {
    const [min, max] = rango === "10-100" ? [10, 100] : [100, 1000];

    if (participantes.length > 0 && !window.confirm("Esto borrará la lista y los puntajes del evento anterior. ¿Continuar?")) return;
    if (!window.confirm(`¿Iniciar el evento con rango ${min} a ${max}?`)) return;

    await supabase.from("puntajes").delete().not("id", "is", null);
    await supabase.from("participantes").delete().not("id", "is", null);

    if (modalidad === "precargada") {
      const filas = PRECARGADOS.map((p) => ({
        nombre: p.nombre,
        tipo: p.tipo,
        orden: p.orden,
        logo_url: logoDe(p.orden),
        estado: "pendiente",
      }));
      const { error } = await supabase.from("participantes").insert(filas);
      if (error) {
        setMensaje(error.message);
        return;
      }
    }

    await supabase
      .from("evento")
      .update({
        estado: modalidad === "precargada" ? "activo" : "cargando",
        modalidad,
        rango_min: min,
        rango_max: max,
        participante_activo_id: null,
      })
      .eq("id", 1);

    setMostrarInicio(false);
    setMensaje("");
    await cargar();
  }

  async function detenerEvento() {
    if (activo) {
      setMensaje("Finaliza primero al participante en calificación");
      return;
    }
    if (!window.confirm("¿Detener el evento? La pantalla pública quedará vacía.")) return;
    await supabase.from("evento").update({ estado: "inactivo", participante_activo_id: null }).eq("id", 1);
    setMensaje("");
    await cargar();
  }

  async function cancelarEvento() {
    if (!window.confirm("⚠️ ¿Cancelar el evento? Esto borrará TODOS los participantes y puntajes y volverá al inicio. Esta acción no se puede deshacer.")) return;
    if (!window.confirm("Última confirmación: ¿estás seguro de cancelar y borrar todo?")) return;
    await supabase.from("puntajes").delete().not("id", "is", null);
    await supabase.from("participantes").delete().not("id", "is", null);
    await supabase.from("evento").update({ estado: "inactivo", participante_activo_id: null }).eq("id", 1);
    setMensaje("");
    await cargar();
  }

  // Carga manual
  async function agregarManual(e: FormEvent) {
    e.preventDefault();
    if (!nuevo.nombre.trim()) return;
    await supabase.from("participantes").insert({
      nombre: nuevo.nombre.trim(),
      tipo: nuevo.tipo,
      orden: participantes.length + 1,
      logo_url: nuevo.logo_url.trim() || null,
      estado: "pendiente",
    });
    setNuevo({ nombre: "", tipo: "docente", logo_url: "" });
    await cargar();
  }

  async function quitarManual(p: Participante) {
    if (!window.confirm(`¿Quitar a ${p.nombre} de la lista?`)) return;
    await supabase.from("participantes").delete().eq("id", p.id);
    await cargar();
  }

  async function confirmarManual() {
    if (participantes.length === 0) {
      setMensaje("Agrega al menos un participante");
      return;
    }
    if (!window.confirm(`¿Confirmar ${participantes.length} participantes?`)) return;
    await supabase.from("evento").update({ estado: "activo" }).eq("id", 1);
    setMensaje("");
    await cargar();
  }

  // Calificación
  async function seleccionar(p: Participante) {
    if (evento?.estado !== "activo" || activo || p.estado !== "pendiente") return;
    if (!window.confirm(`¿Calificar a ${p.nombre}?`)) return;

    await supabase.from("participantes").update({ estado: "en_calificacion" }).eq("id", p.id);
    await supabase.from("evento").update({ participante_activo_id: p.id }).eq("id", 1);
    setSeleccion(null);
    setValorLibre("");
    setMensaje("");
    await cargar();
  }

  async function guardarPuntaje() {
    if (!activo || !evento || juradoSiguiente === undefined || seleccion === null) return;

    if (!Number.isInteger(seleccion) || seleccion < evento.rango_min || seleccion > evento.rango_max) {
      setMensaje(`El puntaje debe ser un número entero entre ${evento.rango_min} y ${evento.rango_max}`);
      return;
    }
    if (!window.confirm(`¿Confirmar ${seleccion} puntos del Jurado ${juradoSiguiente} para ${activo.nombre}?`)) return;

    const { error } = await supabase
      .from("puntajes")
      .upsert(
        { participante_id: activo.id, jurado: juradoSiguiente, puntaje: seleccion },
        { onConflict: "participante_id,jurado" }
      );
    if (error) {
      setMensaje(error.message);
      return;
    }

       const { data: actuales } = await supabase
      .from("puntajes")
      .select("jurado")
      .eq("participante_id", activo.id);

    if ((actuales ?? []).length === 3) {
      await supabase.from("participantes").update({ estado: "calificado" }).eq("id", activo.id);
    }

    setSeleccion(null);
    setValorLibre("");
    setMensaje("");
    await cargar();
  }

  async function marcarNoSePresento() {
    if (!activo || hayPuntajes) return;
    if (!window.confirm(`¿Confirmar que ${activo.nombre} no se presentó?`)) return;
    await supabase.from("participantes").update({ estado: "no_se_presento" }).eq("id", activo.id);
    await cargar();
  }

  async function finalizar() {
    if (!activo || !puedeFinalizar) return;
    if (!window.confirm(`¿Finalizar a ${activo.nombre}? Se quitará de la pantalla pública.`)) return;

    await supabase
      .from("participantes")
      .update({
        estado: activo.estado === "no_se_presento" ? "no_se_presento" : "finalizado",
        finalizado_at: new Date().toISOString(),
      })
      .eq("id", activo.id);
    await supabase.from("evento").update({ participante_activo_id: null }).eq("id", 1);
    setMensaje("");
    await cargar();
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white">
      <HeaderInstitucional />
      <main className="p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Panel de calificación · Festidanza 2026</h1>
          <button onClick={cerrarSesion} className="rounded bg-neutral-700 px-4 py-2 text-white hover:bg-neutral-600">
            Cerrar sesión
          </button>
        </header>

        {mensaje && <p className="rounded bg-amber-900/40 p-3 text-amber-200">{mensaje}</p>}

        {/* Controles del evento */}
        <section className="space-y-4 rounded-xl bg-neutral-800 p-6 shadow border border-neutral-700">
          <p>
            Estado: <strong>{evento?.estado ?? "—"}</strong>
            {evento?.modalidad && <> · Modalidad: <strong>{evento.modalidad}</strong></>}
            {enCurso && <> · Rango: <strong>{evento?.rango_min} a {evento?.rango_max}</strong></>}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {!enCurso && (
              <button
                onClick={() => setMostrarInicio(true)}
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                Iniciar evento
              </button>
            )}
            {enCurso && (
              <>
                <button onClick={detenerEvento} className="rounded bg-red-600 px-4 py-2 text-white">
                  Detener evento
                </button>
                <button
                  onClick={() => window.open("/publico", "_blank")}
                  disabled={evento?.estado !== "activo"}
                  className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
                >
                  Ver pantalla de puntajes
                </button>
                <button
                  onClick={() => window.open("/informe", "_blank")}
                  disabled={!todosListos}
                  className="rounded bg-purple-700 px-4 py-2 text-white disabled:opacity-40"
                >
                  Imprimir
                </button>
                {/* Separador visual */}
                <span className="mx-4 h-8 w-px bg-gray-300" />
                <button
                  onClick={cancelarEvento}
                  className="rounded border-2 border-red-800 bg-red-950 px-4 py-2 text-red-400 hover:bg-red-900 hover:text-red-200"
                >
                  ⚠ Cancelar evento
                </button>
              </>
            )}
          </div>
        </section>

        {/* Configuración de inicio */}
        {mostrarInicio && !enCurso && (
          <section className="space-y-4 rounded-xl bg-neutral-800 p-6 shadow border border-neutral-700">
            <h2 className="text-lg font-semibold text-white">Iniciar evento</h2>

            <div className="flex flex-wrap items-center gap-3">
              <span className="w-28">Rango:</span>
              {(["10-100", "100-1000"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRango(r)}
                  className={`rounded border px-4 py-2 ${rango === r ? "bg-white text-black" : "bg-neutral-700 text-white border-neutral-600"}`}
                >
                  {r.replace("-", " a ")}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="w-28">Participantes:</span>
              <button
                onClick={() => setModalidad("precargada")}
                className={`rounded border px-4 py-2 ${modalidad === "precargada" ? "bg-white text-black" : "bg-neutral-700 text-white border-neutral-600"}`}
              >
                Lista precargada (23)
              </button>
              <button
                onClick={() => setModalidad("manual")}
                className={`rounded border px-4 py-2 ${modalidad === "manual" ? "bg-white text-black" : "bg-neutral-700 text-white border-neutral-600"}`}
              >
                Carga manual
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={iniciarEvento} className="rounded bg-green-600 px-4 py-2 text-white">
                Confirmar inicio
              </button>
              <button onClick={() => setMostrarInicio(false)} className="rounded border px-4 py-2">
                Cancelar
              </button>
            </div>
          </section>
        )}

        {/* Carga manual */}
        {evento?.estado === "cargando" && (
          <section className="space-y-4 rounded-xl bg-neutral-800 p-6 shadow border border-neutral-700">
            <h2 className="text-lg font-semibold text-white">Cargar participantes</h2>
            <form onSubmit={agregarManual} className="grid gap-3 md:grid-cols-4">
              <input
                className="rounded border p-2"
                placeholder="Nombre"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              />
              <select
                className="rounded border p-2"
                value={nuevo.tipo}
                onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value as Tipo })}
              >
                <option value="docente">Docente</option>
                <option value="administrativo">Administrativo</option>
              </select>
              <input
                className="rounded border p-2"
                placeholder="Logo, ej. /images/participantes/24.webp (opcional)"
                value={nuevo.logo_url}
                onChange={(e) => setNuevo({ ...nuevo, logo_url: e.target.value })}
              />
              <button className="rounded bg-gray-900 px-4 py-2 text-white">Agregar</button>
            </form>
            <button onClick={confirmarManual} className="rounded bg-green-700 px-4 py-2 text-white">
              Confirmar participantes ({participantes.length})
            </button>
          </section>
        )}

        {/* Calificación activa */}
        {evento?.estado === "activo" && activo && (
          <section className="space-y-4 rounded-xl border-2 border-amber-500 bg-neutral-800 p-6 shadow">
            <h2 className="text-lg font-semibold">
              En calificación: {activo.nombre}{" "}
              <span className="text-sm text-gray-500">({activo.tipo})</span>
            </h2>

            {[1, 2, 3].map((j) => {
              const valor = puntajeDe(puntajes, activo.id, j);
              const esSiguiente = j === juradoSiguiente && activo.estado === "en_calificacion";

              return (
                <div key={j} className="flex flex-wrap items-center gap-3">
                  <span className="w-24">Jurado {j}</span>

                  {valor !== undefined && <strong className="text-xl">{valor}</strong>}

                  {valor === undefined && esSiguiente && (
                    <div className="w-full space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {opciones.map((op) => (
                          <button
                            key={op}
                            onClick={() => {
                              setSeleccion(op);
                              setValorLibre(String(op));
                            }}
                            className={`rounded border px-3 py-2 ${seleccion === op ? "bg-white text-black" : "bg-neutral-700 text-white border-neutral-600"}`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          placeholder="Otro valor"
                          value={valorLibre}
                          onChange={(e) => {
                            setValorLibre(e.target.value);
                            setSeleccion(e.target.value === "" ? null : Number(e.target.value));
                          }}
                          className="w-32 rounded border p-2"
                        />
                        <button
                          onClick={guardarPuntaje}
                          disabled={seleccion === null}
                          className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-40"
                        >
                          Confirmar Jurado {j}
                        </button>
                      </div>
                    </div>
                  )}

                  {valor === undefined && !esSiguiente && (
                    <span className="text-gray-400">Pendiente</span>
                  )}
                </div>
              );
            })}

            {todosCalificados && (
              <p className="text-lg">
                Total: <strong className="text-2xl">{total}</strong>
              </p>
            )}

            <div className="flex gap-3">
              {!hayPuntajes && activo.estado === "en_calificacion" && (
                <button onClick={marcarNoSePresento} className="rounded bg-orange-600 px-4 py-2 text-white">
                  No se presentó
                </button>
              )}
              {puedeFinalizar && (
                <button onClick={finalizar} className="rounded bg-green-700 px-4 py-2 text-white">
                  Finalizar participante
                </button>
              )}
            </div>
          </section>
        )}

        {/* Lista de participantes */}
        {participantes.length > 0 && (
          <section className="rounded-xl bg-neutral-800 p-6 shadow border border-neutral-700">
            <h2 className="mb-4 text-lg font-semibold text-white">Participantes ({participantes.length})</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">#</th>
                  <th>Participante</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {participantes.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2">{p.orden}</td>
                    <td>{p.nombre}</td>
                    <td>{p.tipo === "docente" ? "Docente" : "Administrativo"}</td>
                    <td>{ETIQUETA[p.estado]}</td>
                    <td className="text-right">
                      {evento?.estado === "cargando" && (
                        <button onClick={() => quitarManual(p)} className="rounded bg-red-600 px-3 py-1 text-white">
                          Quitar
                        </button>
                      )}
                      {evento?.estado === "activo" && p.estado === "pendiente" && (
                        <button
                          onClick={() => seleccionar(p)}
                          disabled={!!activo}
                          className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-40"
                        >
                          Calificar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
      </main>
    </div>
  );
}