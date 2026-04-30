import { Request, Response } from "express";
import * as excelService from "../services/excelImport.service";

<<<<<<< HEAD
=======
export const importarPartidas = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Archivo Excel requerido" });

        const resultado = await excelService.importarPartidasDesdeExcel(req.file.buffer);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const importarProveedores = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Archivo Excel requerido" });

        const resultado = await excelService.importarProveedoresDesdeExcel(req.file.buffer);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

>>>>>>> b5e5bbf39d5a5ae50b88e6c49f0659594491b517
export const importarPresupuesto = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Archivo Excel requerido" });

        const anio = Number(req.query.anio) || new Date().getFullYear();

        const resultado = await excelService.importarPresupuestoDesdeExcel(req.file.buffer, anio);
        res.json(resultado);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};