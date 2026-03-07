import { sequelize } from "../config/db";
import { Requisicion, EstadoRequisicion } from "../models/Requisicion";
import { PresupuestoAnual } from "../models/PresupuestoAnual";

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

    if (!requisicion) {
      throw new Error("Requisición no encontrada");
    }

    console.log("Estado en BD:", requisicion.estado);

    if (requisicion.estado !== EstadoRequisicion.PENDIENTE) {
      throw new Error("La requisición no está pendiente");
    }

    const presupuesto = requisicion.presupuesto;

    if (!presupuesto) {
      throw new Error("Presupuesto no asociado");
    }

    const disponible =
      Number(presupuesto.montoAprobado) - Number(presupuesto.montoEjercido);

    if (disponible < Number(requisicion.total)) {
      throw new Error("Saldo insuficiente");
    }

    presupuesto.montoEjercido =
      Number(presupuesto.montoEjercido) + Number(requisicion.total);

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
