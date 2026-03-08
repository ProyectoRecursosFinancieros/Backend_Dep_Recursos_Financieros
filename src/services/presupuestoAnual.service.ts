import { PresupuestoAnual } from "../models/PresupuestoAnual";
import { Area } from "../models/Area";
import { PartidaPresupuestal } from "../models/PartidaPresupuestal";

export const crearPresupuesto = async (data: any) => {
  const existe = await PresupuestoAnual.findOne({
    where: {
      anio: data.anio,
      areaId: data.areaId,
      partidaId: data.partidaId,
    },
  });

  if (existe) {
    throw new Error("Ya existe presupuesto para esta área y partida en ese año");
  }

  return await PresupuestoAnual.create(data);
};

export const obtenerPresupuestos = async () => {
  return await PresupuestoAnual.findAll({
    include: [Area, PartidaPresupuestal],
  });
};

export const obtenerPresupuestoPorId = async (id: number) => {
  const presupuesto = await PresupuestoAnual.findByPk(id, {
    include: [Area, PartidaPresupuestal],
  });

  if (!presupuesto) {
    throw new Error("Presupuesto no encontrado");
  }

  return presupuesto;
};

export const obtenerPresupuestosPorArea = async (areaId: number) => {
  return await PresupuestoAnual.findAll({
    where: { areaId },
    include: [PartidaPresupuestal],
  });
};

export const actualizarMontoAprobado = async (id: number, montoAprobado: number) => {
  const presupuesto = await PresupuestoAnual.findByPk(id);

  if (!presupuesto) {
    throw new Error("Presupuesto no encontrado");
  }

  await presupuesto.update({ montoAprobado });

  return presupuesto;
};