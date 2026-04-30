import { Request, Response } from "express";
import * as requisicionService from "../services/requisicion.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const crear = async (req: AuthRequest, res: Response) => {
  try {
    const requisicion = await requisicionService.crearRequisicion(req.body);
    return res.status(201).json(requisicion);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const autorizar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "No autenticado" });

    const id = Number(req.params.id);
    const { observaciones } = req.body;

    const result = await requisicionService.autorizarRequisicion(id, req.user.id, observaciones);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const cancelar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "No autenticado" });

    const id = Number(req.params.id);
    const { observaciones } = req.body;

    if (!observaciones?.trim()) {
      return res.status(400).json({ message: "Las observaciones son obligatorias" });
    }

    const result = await requisicionService.cancelarRequisicion(id, req.user.id, observaciones);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const listar = async (_req: Request, res: Response) => {
  try {
    const requisiciones = await requisicionService.obtenerRequisiciones();
    return res.json(requisiciones);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const requisicion = await requisicionService.obtenerRequisicionPorId(Number(req.params.id));
    return res.json(requisicion);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
};

export const generarPDF = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { elabora, valida, revisa, autoriza } = req.body;

    if (!elabora?.nombre || !valida?.nombre || !revisa?.nombre || !autoriza?.nombre) {
      return res.status(400).json({ message: "Se requieren los 4 firmantes (nombre y puesto)" });
    }

    await requisicionService.generarPDFRequisicion(id, res, {
      elabora: { nombre: elabora.nombre, puesto: elabora.puesto || "" },
      valida: { nombre: valida.nombre, puesto: valida.puesto || "" },
      revisa: { nombre: revisa.nombre, puesto: revisa.puesto || "" },
      autoriza: { nombre: autoriza.nombre, puesto: autoriza.puesto || "" }
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};