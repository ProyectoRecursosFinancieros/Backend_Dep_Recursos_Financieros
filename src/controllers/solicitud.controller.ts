import { Request, Response } from "express";
import * as solicitudService from "../services/solicitud.service";

export const crearSolicitud = async (req: Request, res: Response) => {
  try {
    const { areaId, descripcionGeneral, concepto, monto } = req.body;

    if (!areaId || !descripcionGeneral) {
      return res.status(400).json({
        message: "areaId y descripcionGeneral son obligatorios",
      });
    }

    const solicitanteId = (req as any).user.id;

    const solicitud = await solicitudService.crearSolicitud({
      areaId,
      descripcionGeneral,
      solicitanteId,
      concepto,
      monto
    });

    res.status(201).json(solicitud);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const obtenerSolicitudes = async (_req: Request, res: Response) => {
  try {
    const solicitudes = await solicitudService.obtenerSolicitudes();
    res.json(solicitudes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const obtenerSolicitudPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const solicitud = await solicitudService.obtenerSolicitudPorId(id);

    res.json(solicitud);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const enviarSolicitud = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const solicitud = await solicitudService.enviarSolicitud(id);

    res.json(solicitud);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const autorizarSolicitud = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const solicitud = await solicitudService.autorizarSolicitud(id);

    res.json(solicitud);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const rechazarSolicitud = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const solicitud = await solicitudService.rechazarSolicitud(id);

    res.json(solicitud);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};