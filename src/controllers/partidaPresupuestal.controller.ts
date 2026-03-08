import { Request, Response } from "express";
import * as partidaService from "../services/partidaPresupuestal.service";

export const crearPartida = async (req: Request, res: Response) => {
  try {
    const { nombre, codigo } = req.body;

    if (!nombre || !codigo) {
      return res.status(400).json({
        message: "nombre y codigo son obligatorios",
      });
    }

    const partida = await partidaService.crearPartida({
      nombre,
      codigo,
      activa: true,
    });

    res.status(201).json(partida);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const obtenerPartidas = async (_req: Request, res: Response) => {
  try {
    const partidas = await partidaService.obtenerPartidas();
    res.json(partidas);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const obtenerPartidasInactivas = async (_req: Request, res: Response) => {
  try {
    const partidas = await partidaService.obtenerPartidasInactivas();
    res.json(partidas);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const obtenerPartidaPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const partida = await partidaService.obtenerPartidaPorId(id);

    res.json(partida);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const actualizarPartida = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const partida = await partidaService.actualizarPartida(id, req.body);

    res.json(partida);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const desactivarPartida = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await partidaService.desactivarPartida(id);

    res.json(result);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const reactivarPartida = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await partidaService.reactivarPartida(id);

    res.json(result);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};