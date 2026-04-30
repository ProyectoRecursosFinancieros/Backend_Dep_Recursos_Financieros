import { Request, Response } from "express";
import * as maestroService from "../services/presupuestoMaestro.service";

export const obtenerMaestro = async (req: Request, res: Response) => {
    try {
        let anio = Number(req.query.anio);

        // Protección fuerte contra NaN o valores inválidos
        if (isNaN(anio) || anio < 2000 || anio > 2100) {
            anio = new Date().getFullYear();
        }

        const maestro = await maestroService.generarPresupuestoMaestro(anio);
        res.json(maestro);
    } catch (error: any) {
        console.error("Error en presupuesto maestro:", error);
        res.status(500).json({
            message: error.message || "Error interno del servidor"
        });
    }
};