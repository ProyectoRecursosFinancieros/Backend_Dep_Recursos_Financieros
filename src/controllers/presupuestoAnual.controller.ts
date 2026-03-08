import { Request, Response } from "express";
import * as presupuestoService from "../services/presupuestoAnual.service";

export const crearPresupuesto = async (req: Request, res: Response) => {
  try {
    const { anio, areaId, partidaId, montoAprobado } = req.body;

    if (!anio || !areaId || !partidaId || !montoAprobado) {
      return res.status(400).json({
        message: "anio, areaId, partidaId y montoAprobado son obligatorios",
      });
    }

    const presupuesto = await presupuestoService.crearPresupuesto({
      anio,
      areaId,
      partidaId,
      montoAprobado,
    });

    res.status(201).json(presupuesto);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const obtenerPresupuestos = async (_req: Request, res: Response) => {
  try {
    const presupuestos = await presupuestoService.obtenerPresupuestos();
    res.json(presupuestos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const obtenerPresupuestoPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const presupuesto = await presupuestoService.obtenerPresupuestoPorId(id);

    res.json(presupuesto);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const obtenerPresupuestosPorArea = async (req: Request, res: Response) => {
  try {
    const areaId = Number(req.params.areaId);

    const presupuestos = await presupuestoService.obtenerPresupuestosPorArea(areaId);

    res.json(presupuestos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const actualizarMontoAprobado = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { montoAprobado } = req.body;

    const presupuesto = await presupuestoService.actualizarMontoAprobado(
      id,
      montoAprobado
    );

    res.json(presupuesto);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};