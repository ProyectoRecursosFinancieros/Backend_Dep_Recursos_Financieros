import { Response } from "express";
import { IOrdenPagoCreate, AuthRequest } from "../interfaces";
import { ordenPagoService } from "../services/ordenPagoService";

export interface IOrdenPagoController {
  generarOrdenPago(req: AuthRequest, res: Response): Promise<void>;
  obtenerOrdenesPago(req: AuthRequest, res: Response): Promise<void>;
  obtenerOrdenPagoPorId(req: AuthRequest, res: Response): Promise<void>;
  obtenerOrdenPagoPorOrdenCompra(req: AuthRequest, res: Response): Promise<void>;
  marcarPagado(req: AuthRequest, res: Response): Promise<void>;
  cancelarOrdenPago(req: AuthRequest, res: Response): Promise<void>;
}

export const ordenPagoController: IOrdenPagoController = {
  generarOrdenPago: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const ordenCompraId = Number(req.params.ordenCompraId);

      if (!req.user) {
        res.status(401).json({ message: "No autenticado" });
        return;
      }

      if (isNaN(ordenCompraId)) {
        res.status(400).json({ message: "ID de orden de compra inválido" });
        return;
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({
          message: "El cuerpo de la petición no puede estar vacío",
        });
        return;
      }

      const { monto } = req.body as IOrdenPagoCreate;

      if (monto === undefined || monto === null) {
        res.status(400).json({
          message: "Falta el campo monto",
        });
        return;
      }

      if (isNaN(Number(monto))) {
        res.status(400).json({
          message: "El monto debe ser numérico",
        });
        return;
      }

      const result = await ordenPagoService.generar(ordenCompraId, req.user.id, Number(monto));

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

  obtenerOrdenesPago: async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const ordenes = await ordenPagoService.obtenerTodos();
      res.json(ordenes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerOrdenPagoPorId: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await ordenPagoService.obtenerPorId(id);

      if (!result.success) {
        res.status(404).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  obtenerOrdenPagoPorOrdenCompra: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const ordenCompraId = Number(req.params.ordenCompraId);

      if (isNaN(ordenCompraId)) {
        res.status(400).json({ message: "ID de orden de compra inválido" });
        return;
      }

      const result = await ordenPagoService.obtenerPorOrdenCompra(ordenCompraId);

      if (!result.success) {
        res.status(404).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  marcarPagado: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await ordenPagoService.marcarPagado(id);

      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  cancelarOrdenPago: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: "ID inválido" });
        return;
      }

      const result = await ordenPagoService.cancelar(id);

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
