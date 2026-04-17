import { Request, Response } from "express";
import {
  IPartidaPresupuestalCreate,
  IPartidaPresupuestalUpdate
} from "../interfaces";
import { partidaPresupuestalService } from "../services/partidaPresupuestalService";

export interface IPartidaPresupuestalController {
  crearPartida(req: Request, res: Response): Promise<void>;
  obtenerPartidas(req: Request, res: Response): Promise<void>;
  obtenerPartidasInactivas(req: Request, res: Response): Promise<void>;
  obtenerPartidaPorId(req: Request, res: Response): Promise<void>;
  actualizarPartida(req: Request, res: Response): Promise<void>;
  desactivarPartida(req: Request, res: Response): Promise<void>;
  reactivarPartida(req: Request, res: Response): Promise<void>;
}

export const partidaPresupuestalController: IPartidaPresupuestalController = {
  crearPartida: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await partidaPresupuestalService.crear(req.body as IPartidaPresupuestalCreate);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerPartidas: async (_req: Request, res: Response): Promise<void> => {
    try {
      const partidas = await partidaPresupuestalService.obtenerTodos();
      res.json(partidas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerPartidasInactivas: async (_req: Request, res: Response): Promise<void> => {
    try {
      const partidas = await partidaPresupuestalService.obtenerInactivos();
      res.json(partidas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerPartidaPorId: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await partidaPresupuestalService.obtenerPorId(id);

      if (!result.success) {
        res.status(404).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  actualizarPartida: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await partidaPresupuestalService.actualizar(id, req.body as IPartidaPresupuestalUpdate);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  desactivarPartida: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await partidaPresupuestalService.desactivar(id);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  reactivarPartida: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await partidaPresupuestalService.reactivar(id);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
