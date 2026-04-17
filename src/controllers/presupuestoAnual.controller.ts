import { Request, Response } from "express";
import {
  IPresupuestoAnualCreate,
  IPresupuestoAnualUpdate
} from "../interfaces";
import { presupuestoAnualService } from "../services/presupuestoAnualService";

export interface IPresupuestoAnualController {
  crearPresupuesto(req: Request, res: Response): Promise<void>;
  obtenerPresupuestos(req: Request, res: Response): Promise<void>;
  obtenerPresupuestoPorId(req: Request, res: Response): Promise<void>;
  obtenerPresupuestosPorArea(req: Request, res: Response): Promise<void>;
  obtenerPresupuestosPorAnio(req: Request, res: Response): Promise<void>;
  actualizarMontoAprobado(req: Request, res: Response): Promise<void>;
  actualizarPresupuesto(req: Request, res: Response): Promise<void>;
  obtenerSaldoDisponible(req: Request, res: Response): Promise<void>;
}

export const presupuestoAnualController: IPresupuestoAnualController = {
  crearPresupuesto: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await presupuestoAnualService.crear(req.body as IPresupuestoAnualCreate);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerPresupuestos: async (_req: Request, res: Response): Promise<void> => {
    try {
      const presupuestos = await presupuestoAnualService.obtenerTodos();
      res.json(presupuestos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerPresupuestoPorId: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await presupuestoAnualService.obtenerPorId(id);

      if (!result.success) {
        res.status(404).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerPresupuestosPorArea: async (req: Request, res: Response): Promise<void> => {
    try {
      const areaId = Number(req.params.areaId);

      if (isNaN(areaId)) {
        res.status(400).json({ message: "ID de área inválido" });
        return;
      }

      const presupuestos = await presupuestoAnualService.obtenerPorArea(areaId);
      res.json(presupuestos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerPresupuestosPorAnio: async (req: Request, res: Response): Promise<void> => {
    try {
      const anio = Number(req.params.anio);

      if (isNaN(anio)) {
        res.status(400).json({ message: "Año inválido" });
        return;
      }

      const presupuestos = await presupuestoAnualService.obtenerPorAnio(anio);
      res.json(presupuestos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  actualizarMontoAprobado: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { montoAprobado } = req.body as IPresupuestoAnualUpdate;

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      if (montoAprobado === undefined) {
        res.status(400).json({ message: "montoAprobado es requerido" });
        return;
      }

      const result = await presupuestoAnualService.actualizarMontoAprobado(id, montoAprobado);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  actualizarPresupuesto: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await presupuestoAnualService.actualizar(id, req.body as IPresupuestoAnualUpdate);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerSaldoDisponible: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await presupuestoAnualService.obtenerSaldoDisponible(id);

      if (!result.success) {
        res.status(404).json({ message: result.message });
        return;
      }

      res.json({
        presupuestoId: id,
        saldoDisponible: result.saldo,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
