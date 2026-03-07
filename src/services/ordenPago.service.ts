import { sequelize } from "../config/db";
import { OrdenCompra } from "../models/OrdenCompra";
import { OrdenPago, EstadoPago } from "../models/OrdenPago";

export const generarOrdenPago = async (
  ordenCompraId: number,
  usuarioId: number,
  monto: number,
) => {
  const transaction = await sequelize.transaction();

  try {
    const ordenCompra = await OrdenCompra.findByPk(ordenCompraId, {
      transaction,
    });

    if (!ordenCompra) {
      throw new Error("Orden de compra no encontrada");
    }

    const pagoExistente = await OrdenPago.findOne({
      where: { ordenCompraId },
      transaction,
    });

    if (pagoExistente) {
      throw new Error("Ya existe una orden de pago para esta orden de compra");
    }

    if (Number(monto) <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }

    if (Number(monto) > Number(ordenCompra.total)) {
      throw new Error("El monto no puede exceder el total de la orden");
    }

    const nuevaOrdenPago = await OrdenPago.create(
      {
        ordenCompraId,
        monto,
        estado: EstadoPago.PENDIENTE,
        autorizadoPorId: usuarioId,
      },
      { transaction },
    );

    await transaction.commit();

    return nuevaOrdenPago;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
