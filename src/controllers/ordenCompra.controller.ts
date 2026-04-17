import { Request, Response } from "express";
import { IOrdenCompraCreate } from "../interfaces";
import { ordenCompraService } from "../services/ordenCompraService";

export interface IOrdenCompraController {
  generarOrdenCompra(req: Request, res: Response): Promise<void>;
  listarOrdenesCompra(req: Request, res: Response): Promise<void>;
  obtenerOrdenCompraPorId(req: Request, res: Response): Promise<void>;
  obtenerPorRequisicion(req: Request, res: Response): Promise<void>;
}

export const ordenCompraController: IOrdenCompraController = {
  generarOrdenCompra: async (req: Request, res: Response): Promise<void> => {
    try {
      const requisicionId = Number(req.params.requisicionId);

      if (isNaN(requisicionId)) {
        res.status(400).json({
          message: "ID de requisición inválido",
        });
        return;
      }

      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({
          message: "Body requerido",
        });
        return;
      }

      const { proveedorId, tipoContratacion } = req.body as IOrdenCompraCreate;

      const camposFaltantes: string[] = [];
      if (!proveedorId) camposFaltantes.push("proveedorId");
      if (!tipoContratacion) camposFaltantes.push("tipoContratacion");

      if (camposFaltantes.length > 0) {
        res.status(400).json({
          message: "Faltan campos requeridos",
          camposFaltantes,
        });
        return;
      }

      const result = await ordenCompraService.crear({
        requisicionId,
        proveedorId,
        tipoContratacion,
      });

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.status(201).json(result);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Error interno del servidor",
      });
    }
  },

  listarOrdenesCompra: async (_req: Request, res: Response): Promise<void> => {
    try {
      const ordenes = await ordenCompraService.obtenerTodos();
      res.json(ordenes);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener órdenes",
      });
    }
  },

  obtenerOrdenCompraPorId: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await ordenCompraService.obtenerPorId(id);

      if (!result.success) {
        res.status(404).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerPorRequisicion: async (req: Request, res: Response): Promise<void> => {
    try {
      const requisicionId = Number(req.params.requisicionId);

      if (isNaN(requisicionId)) {
        res.status(400).json({ message: "ID de requisición inválido" });
        return;
      }

      const result = await ordenCompraService.obtenerPorRequisicion(requisicionId);

      if (!result.success) {
        res.status(404).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
