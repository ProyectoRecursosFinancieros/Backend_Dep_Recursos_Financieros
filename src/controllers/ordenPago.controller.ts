import { Request, Response } from "express";
import { generarOrdenPago } from "../services/ordenPago.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const crearOrdenPago = async (req: AuthRequest, res: Response) => {
  try {
    const ordenCompraId = Number(req.params.ordenCompraId);

    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ message: "ID de orden inválido" });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "El cuerpo de la petición no puede estar vacío",
      });
    }

    const { monto } = req.body;

    if (monto === undefined || monto === null) {
      return res.status(400).json({
        message: "Falta el campo monto",
      });
    }

    if (isNaN(Number(monto))) {
      return res.status(400).json({
        message: "El monto debe ser numérico",
      });
    }

    const resultado = await generarOrdenPago(
      ordenCompraId,
      req.user.id,
      Number(monto),
    );

    return res.status(201).json({
      message: "Orden de pago generada correctamente",
      ordenPago: resultado,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
