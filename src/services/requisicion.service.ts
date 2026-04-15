import { sequelize } from "../config/db";
import { Requisicion, EstadoRequisicion } from "../models/Requisicion";
import { PresupuestoAnual } from "../models/PresupuestoAnual";
import { Solicitud, EstadoSolicitud } from "../models/Solicitud";
import { RequisicionDetalle } from "../models/RequisicionDetalle";

export const crearRequisicion = async (data: any) => {
  const transaction = await sequelize.transaction();
  try {
    const solicitud = await Solicitud.findByPk(data.solicitudId, { transaction });
    if (!solicitud) throw new Error("Solicitud no encontrada");
    if (solicitud.estado !== EstadoSolicitud.AUTORIZADA) throw new Error("La solicitud debe estar AUTORIZADA");

    const mesActual = new Date().getMonth() + 1;
    if (data.mes && (data.mes < mesActual || data.mes > 12)) {
      throw new Error("El mes de la requisición no es válido según el periodo actual");
    }

    if (!data.detalles || data.detalles.length === 0) throw new Error("La requisición debe tener al menos un detalle");

    let total = 0;
    const detallesProcesados = data.detalles.map((d: any) => {
      const subtotal = Number(d.cantidad) * Number(d.precioUnitario);
      const impuestos = Number(d.impuestos || 0);
      const retenciones = Number(d.retenciones || 0);
      const totalLinea = subtotal + impuestos - retenciones;
      total += totalLinea;
      return { ...d, subtotal, impuestos, retenciones };
    });

    const requisicion = await Requisicion.create({
      solicitudId: data.solicitudId,
      presupuestoId: data.presupuestoId,
      total
    }, { transaction });

    const detallesConId = detallesProcesados.map((d: any) => ({
      ...d,
      requisicionId: requisicion.id
    }));

    await RequisicionDetalle.bulkCreate(detallesConId, { transaction });

    await transaction.commit();
    return requisicion;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const autorizarRequisicion = async (
  requisicionId: number,
  usuarioId: number,
) => {
  const transaction = await sequelize.transaction();
  try {
    const requisicion = await Requisicion.findByPk(requisicionId, {
      include: [PresupuestoAnual],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!requisicion) throw new Error("Requisición no encontrada");
    if (requisicion.estado !== EstadoRequisicion.PENDIENTE) {
      throw new Error("La requisición no está pendiente");
    }

    const presupuesto = requisicion.presupuesto;
    if (!presupuesto) throw new Error("Presupuesto no asociado");

    const disponible = Number(presupuesto.montoAprobado) - Number(presupuesto.montoEjercido);
    const requerido = Number(requisicion.total);

    if (disponible < requerido) {
      throw new Error(
        `Saldo insuficiente en el presupuesto. Disponible: $${disponible.toLocaleString('es-MX')} | Requerido: $${requerido.toLocaleString('es-MX')}`
      );
    }

    presupuesto.montoEjercido += requerido;
    await presupuesto.save({ transaction });

    requisicion.estado = EstadoRequisicion.AUTORIZADA;
    requisicion.autorizadoPorId = usuarioId;
    requisicion.fechaAutorizacion = new Date();

    await requisicion.save({ transaction });
    await transaction.commit();

    return requisicion;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const cancelarRequisicion = async (requisicionId: number) => {
  const transaction = await sequelize.transaction();
  try {
    const requisicion = await Requisicion.findByPk(requisicionId, {
      include: [PresupuestoAnual],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!requisicion) {
      throw new Error("Requisición no encontrada");
    }
    if (requisicion.estado !== EstadoRequisicion.AUTORIZADA) {
      throw new Error("Solo se pueden cancelar requisiciones autorizadas");
    }
    if (!requisicion.presupuesto) {
      throw new Error("Presupuesto no asociado");
    }
    const presupuesto = requisicion.presupuesto;
    presupuesto.montoEjercido =
      Number(presupuesto.montoEjercido) - Number(requisicion.total);
    await presupuesto.save({ transaction });
    requisicion.estado = EstadoRequisicion.CANCELADA;
    await requisicion.save({ transaction });
    await transaction.commit();
    return requisicion;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const obtenerRequisiciones = async () => {
  return await Requisicion.findAll({
    include: [
      { model: Solicitud },
      { model: PresupuestoAnual },
      { model: RequisicionDetalle },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const obtenerRequisicionPorId = async (id: number) => {
  const requisicion = await Requisicion.findByPk(id, {
    include: [
      { model: Solicitud },
      { model: PresupuestoAnual },
      { model: RequisicionDetalle },
    ],
  });
  if (!requisicion) {
    throw new Error("Requisición no encontrada");
  }
  return requisicion;
};