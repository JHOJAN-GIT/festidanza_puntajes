import type { Tipo } from "./concurso";

export const logoDe = (orden: number) =>
  `/images/participantes/${String(orden).padStart(2, "0")}.png`;

export const PRECARGADOS: { orden: number; nombre: string; tipo: Tipo }[] = [
  { orden: 1, nombre: "Facultad de Agronomía - Santiago", tipo: "docente" },
  { orden: 2, nombre: "Facultad de Antropología - Chonguinada (Junín)", tipo: "docente" },
  { orden: 3, nombre: "Facultad de Ingeniería de Sistemas - Quiulla Danza", tipo: "docente" },
  { orden: 4, nombre: "Facultad de Sociología - Carnaval de Congalla", tipo: "docente" },
  { orden: 5, nombre: "Facultad de Ingeniería de Minas Los Shapish (Chupaca)", tipo: "docente" },
  { orden: 6, nombre: "Oficina de Alta Dirección - Llamerada (Puno)", tipo: "administrativo" },
  { orden: 7, nombre: "Facultad de Ciencias Agrarias - Casacalle «Marinera Ancashina»", tipo: "docente" },
  { orden: 8, nombre: "Facultad de Metalurgia - Carnaval Huamanquino", tipo: "docente" },
  { orden: 9, nombre: "Bienestar Universitario - Chalay Saraputuy", tipo: "administrativo" },
  { orden: 10, nombre: "Oficina de Recursos Humanos - shacshash", tipo: "administrativo" },
  { orden: 11, nombre: "Facultad de Química - Morenada (Puno)", tipo: "docente" },
  { orden: 12, nombre: "Facultad de Administración - La Jija (Paccha)", tipo: "docente" },
  { orden: 13, nombre: "Facultad de Trabajo Social - Carnaval Ayacuchano", tipo: "docente" },
  { orden: 14, nombre: "Facultad de Arquitectura - Carnaval Jaujino", tipo: "docente" },
  { orden: 15, nombre: "Oficina de Planeamiento y Presupuesto - Diablada (Puno)", tipo: "administrativo" },
  { orden: 16, nombre: "Facultad de Enfermería - Carnaval Marqueño", tipo: "docente" },
  { orden: 17, nombre: "Facultad de Ingeniería Civil Tunantada (Yauyos-Jauja)", tipo: "docente" },
  { orden: 18, nombre: "Facultad de Contabilidad - Capitanía (Chongos B.)", tipo: "docente" },
  { orden: 19, nombre: "Facultad de Zootecnia - Tunantada Huaripampa", tipo: "docente" },
  { orden: 20, nombre: "Facultad de Ciencias Aplicadas Tarma La Pachahuara (Tarma)", tipo: "docente" },
  { orden: 21, nombre: "Oficina de Patrimonio - Sincuy", tipo: "administrativo" },
  { orden: 22, nombre: "Oficina de Abastecimiento - La Kullawada (Puno)", tipo: "administrativo" },
  { orden: 23, nombre: "Centro Preuniversitario - Carnaval Marqueño", tipo: "administrativo" },
];