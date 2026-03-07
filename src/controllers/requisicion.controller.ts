import {
  autorizarRequisicion,
  cancelarRequisicion,
} from "../services/requisicion.service";

import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

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
