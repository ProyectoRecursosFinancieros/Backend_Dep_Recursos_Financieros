import { Request, Response } from "express";
import {
  IProveedorCreate,
  IProveedorUpdate
} from "../interfaces";
import { proveedorService } from "../services/proveedorService";

export interface IProveedorController {
  crearProveedor(req: Request, res: Response): Promise<void>;
  obtenerProveedores(req: Request, res: Response): Promise<void>;
  obtenerProveedorPorId(req: Request, res: Response): Promise<void>;
  actualizarProveedor(req: Request, res: Response): Promise<void>;
  obtenerProveedoresInactivos(req: Request, res: Response): Promise<void>;
  desactivarProveedor(req: Request, res: Response): Promise<void>;
  reactivarProveedor(req: Request, res: Response): Promise<void>;
}

export const proveedorController: IProveedorController = {
  crearProveedor: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await proveedorService.crear(req.body as IProveedorCreate);

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

  obtenerProveedores: async (_req: Request, res: Response): Promise<void> => {
    try {
      const proveedores = await proveedorService.obtenerTodos();
      res.json(proveedores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerProveedorPorId: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await proveedorService.obtenerPorId(id);

      if (!result.success) {
        res.status(404).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },

  actualizarProveedor: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await proveedorService.actualizar(id, req.body as IProveedorUpdate);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },

  obtenerProveedoresInactivos: async (_req: Request, res: Response): Promise<void> => {
    try {
      const proveedores = await proveedorService.obtenerInactivos();
      res.json(proveedores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  desactivarProveedor: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await proveedorService.desactivar(id);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },

  reactivarProveedor: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await proveedorService.reactivar(id);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
};
