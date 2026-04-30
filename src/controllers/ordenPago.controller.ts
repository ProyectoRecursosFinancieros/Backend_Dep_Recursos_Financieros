import { Request, Response } from "express";
import * as ordenPagoService from "../services/ordenPago.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { OrdenPago } from "../models/OrdenPago";
import { OrdenCompra } from "../models/OrdenCompra";

export const crearOrdenPago = async (req: AuthRequest, res: Response) => {
  try {
    const ordenCompraId = Number(req.params.ordenCompraId);
    if (isNaN(ordenCompraId)) return res.status(400).json({ message: "ID de orden inválido" });

    if (!req.user) return res.status(401).json({ message: "No autenticado" });

    const { monto } = req.body;
    if (!monto || isNaN(Number(monto))) return res.status(400).json({ message: "El monto debe ser numérico" });

    const resultado = await ordenPagoService.generarOrdenPago(
      ordenCompraId,
      req.user.id,
      Number(monto)
    );

    res.status(201).json({
      message: "Orden de pago generada correctamente",
      ordenPago: resultado
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const descargarPDF = async (req: Request, res: Response) => {
  try {
    const ordenPagoId = Number(req.params.id);
    if (isNaN(ordenPagoId)) return res.status(400).json({ message: "ID inválido" });

    await ordenPagoService.generarPDFOrdenPago(ordenPagoId, res);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const listarOrdenesPago = async (_req: Request, res: Response) => {
  try {
    const ordenes = await OrdenPago.findAll({
      include: [
        {
          model: OrdenCompra,
          include: ["requisicion", "proveedor"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return res.json(ordenes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener las órdenes de pago"
    });
  }
};