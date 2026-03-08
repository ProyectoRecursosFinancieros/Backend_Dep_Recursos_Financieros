import { sequelize } from "../config/db";
import { Requisicion, EstadoRequisicion } from "../models/Requisicion";
import { PresupuestoAnual } from "../models/PresupuestoAnual";
import { Solicitud, EstadoSolicitud } from "../models/Solicitud";
import { RequisicionDetalle } from "../models/RequisicionDetalle";

type DetalleProcesado = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  impuestos: number;
  retenciones: number;
};

export const crearRequisicion = async (data: any) => {
  const transaction = await sequelize.transaction();

  try {
    const solicitud = await Solicitud.findByPk(data.solicitudId, { transaction });

    if (!solicitud) {
      throw new Error("Solicitud no encontrada");
    }

    if (solicitud.estado !== EstadoSolicitud.AUTORIZADA) {
      throw new Error("La solicitud debe estar AUTORIZADA");
    }

    if (!data.detalles || data.detalles.length === 0) {
      throw new Error("La requisición debe tener al menos un detalle");
    }

    let total = 0;

    const detallesProcesados: DetalleProcesado[] = data.detalles.map((d: any) => {
      const subtotal = Number(d.cantidad) * Number(d.precioUnitario);

      const impuestos = Number(d.impuestos || 0);
      const retenciones = Number(d.retenciones || 0);

      const totalLinea = subtotal + impuestos - retenciones;

      total += totalLinea;

      return {
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal,
        impuestos,
        retenciones,
      };
    });

    const requisicion = await Requisicion.create(
      {
        solicitudId: data.solicitudId,
        presupuestoId: data.presupuestoId,
        total,
      },
      { transaction }
    );

    const detalles: (DetalleProcesado & { requisicionId: number })[] =
  detallesProcesados.map((d) => ({
    ...d,
    requisicionId: requisicion.id,
  }));

    await RequisicionDetalle.bulkCreate(detalles, { transaction });

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

//TODO: Filtra por estado
export const obtenerRequisiciones = async () => {
  return await Requisicion.findAll({
    include: [
      {
        model: Solicitud,
      },
      {
        model: PresupuestoAnual,
      },
      {
        model: RequisicionDetalle,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const obtenerRequisicionPorId = async (id: number) => {
  const requisicion = await Requisicion.findByPk(id, {
    include: [
      {
        model: Solicitud,
      },
      {
        model: PresupuestoAnual,
      },
      {
        model: RequisicionDetalle,
      },
    ],
  });

  if (!requisicion) {
    throw new Error("Requisición no encontrada");
  }

  return requisicion;
};
