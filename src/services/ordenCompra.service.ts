import { OrdenCompra, TipoContratacion } from "../models/OrdenCompra";
import { Requisicion, EstadoRequisicion } from "../models/Requisicion";
import { Proveedor } from "../models/Proveedor";

export const crearOrdenCompra = async (
  requisicionId: number,
  proveedorId: number,
  tipoContratacion: TipoContratacion
) => {

  const requisicion = await Requisicion.findByPk(requisicionId);

  if (!requisicion) {
    throw new Error("Requisición no encontrada");
  }

  if (requisicion.estado !== EstadoRequisicion.AUTORIZADA) {
    throw new Error("La requisición debe estar AUTORIZADA");
  }

  const ordenExistente = await OrdenCompra.findOne({
    where: { requisicionId }
  });

  if (ordenExistente) {
    throw new Error("Ya existe una orden de compra");
  }

  const proveedor = await Proveedor.findByPk(proveedorId);

  if (!proveedor || !proveedor.activo) {
    throw new Error("Proveedor inválido");
  }

  const numeroOrden = `OC-${Date.now()}`;

  const orden = await OrdenCompra.create({
    numeroOrden,
    requisicionId,
    proveedorId,
    tipoContratacion,
    total: requisicion.total
  });

  return orden;
};

export const obtenerOrdenesCompra = async () => {
  return await OrdenCompra.findAll({
    include: ["requisicion", "proveedor"]
  });
};