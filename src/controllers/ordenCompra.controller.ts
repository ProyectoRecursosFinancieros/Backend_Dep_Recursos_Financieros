import { Request, Response } from "express";
import { OrdenCompra, TipoContratacion } from "../models/OrdenCompra";
import { Requisicion, EstadoRequisicion } from "../models/Requisicion";
import { Proveedor } from "../models/Proveedor";

export const generarOrdenCompra = async (req: Request, res: Response) => {
  try {
    const requisicionId = Number(req.params.requisicionId);

    if (isNaN(requisicionId)) {
      return res.status(400).json({
        message: "ID de requisición inválido",
      });
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        message: "Body requerido",
      });
    }

    const { proveedorId, tipoContratacion } = req.body;

    const camposFaltantes: string[] = [];

    if (!proveedorId) camposFaltantes.push("proveedorId");
    if (!tipoContratacion) camposFaltantes.push("tipoContratacion");

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        message: "Faltan campos requeridos",
        camposFaltantes,
      });
    }

    const requisicion = await Requisicion.findByPk(requisicionId);

    if (!requisicion) {
      return res.status(404).json({
        message: "Requisición no encontrada",
      });
    }

    if (requisicion.estado !== EstadoRequisicion.AUTORIZADA) {
      return res.status(400).json({
        message: "La requisición debe estar AUTORIZADA para generar orden",
      });
    }

    const ordenExistente = await OrdenCompra.findOne({
      where: { requisicionId },
    });

    if (ordenExistente) {
      return res.status(400).json({
        message: "Ya existe una orden de compra para esta requisición",
      });
    }

    const proveedor = await Proveedor.findByPk(Number(proveedorId));

    if (!proveedor || !proveedor.activo) {
      return res.status(400).json({
        message: "Proveedor inválido o inactivo",
      });
    }

    if (!Object.values(TipoContratacion).includes(tipoContratacion)) {
      return res.status(400).json({
        message: "Tipo de contratación inválido",
        valoresPermitidos: Object.values(TipoContratacion),
      });
    }

    const numeroOrden = `OC-${Date.now()}`;

    const nuevaOrden = await OrdenCompra.create({
      numeroOrden,
      requisicionId: requisicion.id,
      proveedorId: Number(proveedorId),
      tipoContratacion,
      total: requisicion.total,
    });

    return res.status(201).json({
      message: "Orden de compra generada correctamente",
      orden: nuevaOrden,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const listarOrdenesCompra = async (_req: Request, res: Response) => {
  try {
    const ordenes = await OrdenCompra.findAll({
      include: ["requisicion", "proveedor"],
    });

    return res.json(ordenes);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener órdenes",
    });
  }
};
