export type Tipo = "docente" | "administrativo";
export type Estado = "pendiente" | "en_calificacion" | "calificado" | "finalizado" | "no_se_presento";

export type Participante = {
  id: string;
  nombre: string;
  tipo: Tipo;
  logo_url: string | null;
  orden: number | null;
  estado: Estado;
  finalizado_at: string | null;
};

export type Puntaje = { participante_id: string; jurado: number; puntaje: number | string };

export type Evento = {
  id: number;
  estado: "inactivo" | "cargando" | "activo";
  modalidad: "precargada" | "manual" | null;
  participante_activo_id: string | null;
  rango_min: number;
  rango_max: number;
};

// 10 a 100: botones de 10 en 10. 100 a 1000: botones de 100 en 100.
export function opcionesBoton(ev: Pick<Evento, "rango_min" | "rango_max">): number[] {
  const paso = ev.rango_min === 10 ? 10 : 100;
  const lista: number[] = [];
  for (let v = ev.rango_min; v <= ev.rango_max; v += paso) lista.push(v);
  return lista;
}

export function puntajeDe(puntajes: Puntaje[], participanteId: string, jurado: number): number | undefined {
  const p = puntajes.find((x) => x.participante_id === participanteId && x.jurado === jurado);
  return p === undefined ? undefined : Number(p.puntaje);
}

export function completo(puntajes: Puntaje[], participanteId: string): boolean {
  return [1, 2, 3].every((j) => puntajeDe(puntajes, participanteId, j) !== undefined);
}

export function totalDe(puntajes: Puntaje[], participanteId: string): number {
  return [1, 2, 3].reduce((s, j) => s + (puntajeDe(puntajes, participanteId, j) ?? 0), 0);
}

// Empates: mismo puesto. Ej.: 100, 100, 90 -> puestos 1, 1, 3
export function ranking<T extends { total: number }>(items: T[]) {
  return items
    .map((it) => ({ ...it, puesto: 1 + items.filter((o) => o.total > it.total).length }))
    .sort((a, b) => a.puesto - b.puesto);
}