import { Response } from "express";
import {
  IRequisicionCreate,
  EstadoRequisicion,
  AuthRequest
} from "../interfaces";
import { requisicionService } from "../services/requisicionService";

export interface IRequisicionController {
  crear(req: AuthRequest, res: Response): Promise<void>;
  autorizar(req: AuthRequest, res: Response): Promise<void>;
  cancelar(req: AuthRequest, res: Response): Promise<void>;
  listar(req: AuthRequest, res: Response): Promise<void>;
  obtenerPorId(req: AuthRequest, res: Response): Promise<void>;
}

export const requisicionController: IRequisicionController = {
  crear: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { solicitudId, presupuestoId, detalles } = req.body as IRequisicionCreate;

      if (!solicitudId || !presupuestoId || !detalles?.length) {
        res.status(400).json({
          message: "solicitudId, presupuestoId y detalles son obligatorios",
        });
        return;
      }

      const result = await requisicionService.crear({
        solicitudId,
        presupuestoId,
        detalles,
      });

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  },

  autorizar: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          message: "No autenticado",
        });
        return;
      }

      const result = await requisicionService.autorizar(Number(id), req.user.id);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  },

  cancelar: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await requisicionService.cancelar(Number(id));

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  },

  listar: async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const requisiciones = await requisicionService.obtenerTodas();
      res.json(requisiciones);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },

  obtenerPorId: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await requisicionService.obtenerPorId(Number(id));

      if (!result.success) {
        res.status(404).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(404).json({
        message: error.message,
      });
    }
  },
};
