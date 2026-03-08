import { PartidaPresupuestal } from "../models/PartidaPresupuestal";

export const crearPartida = async (data: any) => {
  return await PartidaPresupuestal.create(data);
};

export const obtenerPartidas = async () => {
  return await PartidaPresupuestal.findAll({
    where: { activa: true },
  });
};

export const obtenerPartidasInactivas = async () => {
  return await PartidaPresupuestal.findAll({
    where: { activa: false },
  });
};

export const obtenerPartidaPorId = async (id: number) => {
  const partida = await PartidaPresupuestal.findByPk(id);

  if (!partida) {
    throw new Error("Partida presupuestal no encontrada");
  }

  return partida;
};

export const actualizarPartida = async (id: number, data: any) => {
  const partida = await PartidaPresupuestal.findByPk(id);

  if (!partida) {
    throw new Error("Partida presupuestal no encontrada");
  }

  await partida.update(data);

  return partida;
};

export const desactivarPartida = async (id: number) => {
  const partida = await PartidaPresupuestal.findByPk(id);

  if (!partida) {
    throw new Error("Partida presupuestal no encontrada");
  }

  await partida.update({ activa: false });

  return { message: "Partida desactivada correctamente" };
};

export const reactivarPartida = async (id: number) => {
  const partida = await PartidaPresupuestal.findByPk(id);

  if (!partida) {
    throw new Error("Partida presupuestal no encontrada");
  }

  await partida.update({ activa: true });

  return { message: "Partida reactivada correctamente" };
};