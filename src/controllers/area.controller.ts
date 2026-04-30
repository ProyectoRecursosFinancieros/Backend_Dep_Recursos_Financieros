import { Request, Response } from "express";
import * as areaService from "../services/area.service";

export const crearArea = async (req: Request, res: Response) => {
    try {
        const area = await areaService.crearArea(req.body);
        res.status(201).json(area);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const obtenerAreas = async (_req: Request, res: Response) => {
    try {
        const areas = await areaService.obtenerAreas();
        res.json(areas);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const obtenerAreaPorId = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const area = await areaService.obtenerAreaPorId(id);
        res.json(area);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const actualizarArea = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const area = await areaService.actualizarArea(id, req.body);
        res.json(area);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};