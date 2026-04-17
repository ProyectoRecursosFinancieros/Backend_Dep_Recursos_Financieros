import { Response } from "express";
import {
  ISolicitudCreate,
  AuthRequest
} from "../interfaces";
import { solicitudService } from "../services/solicitudService";

export interface ISolicitudController {
  crearSolicitud(req: AuthRequest, res: Response): Promise<void>;
  obtenerSolicitudes(req: AuthRequest, res: Response): Promise<void>;
  obtenerSolicitudPorId(req: AuthRequest, res: Response): Promise<void>;
  enviarSolicitud(req: AuthRequest, res: Response): Promise<void>;
  autorizarSolicitud(req: AuthRequest, res: Response): Promise<void>;
  rechazarSolicitud(req: AuthRequest, res: Response): Promise<void>;
}

export const solicitudController: ISolicitudController = {
  crearSolicitud: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { areaId, descripcionGeneral } = req.body as ISolicitudCreate;

      if (!areaId || !descripcionGeneral) {
        res.status(400).json({
          message: "areaId y descripcionGeneral son obligatorios",
        });
        return;
      }

      const solicitanteId = req.user?.id;
      if (!solicitanteId) {
        res.status(401).json({ message: "No autenticado" });
        return;
      }

      const result = await solicitudService.crear({
        areaId,
        descripcionGeneral,
        solicitanteId,
      });

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },

  obtenerSolicitudes: async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const solicitudes = await solicitudService.obtenerTodas();
      res.json(solicitudes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerSolicitudPorId: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const result = await solicitudService.obtenerPorId(id);

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

  enviarSolicitud: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const result = await solicitudService.enviar(id);

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

  autorizarSolicitud: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const result = await solicitudService.autorizar(id);

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

  rechazarSolicitud: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const result = await solicitudService.rechazar(id);

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
};
