import {
  autorizarRequisicion,
  cancelarRequisicion,
  crearRequisicion,
  obtenerRequisiciones,
  obtenerRequisicionPorId,
} from "../services/requisicion.service";

import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

export const crear = async (req: AuthRequest, res: Response) => {
  try {
    const { solicitudId, presupuestoId, detalles } = req.body;

    const requisicion = await crearRequisicion({
      solicitudId,
      presupuestoId,
      detalles,
    });

    return res.status(201).json(requisicion);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const autorizar = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const usuarioId = req.user.id;

    const result = await autorizarRequisicion(Number(id), usuarioId);

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const cancelar = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await cancelarRequisicion(Number(id));

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const listar = async (_req: AuthRequest, res: Response) => {
  try {
    const requisiciones = await obtenerRequisiciones();

    return res.json(requisiciones);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const obtenerPorId = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const requisicion = await obtenerRequisicionPorId(Number(id));

    return res.json(requisicion);
  } catch (error: any) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
