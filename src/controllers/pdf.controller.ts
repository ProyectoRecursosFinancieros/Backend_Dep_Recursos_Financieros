import { Request, Response } from "express";
import { pdfService, DatosSolicitudPDF } from "../services/pdfService";

export interface IPdfController {
  generarSolicitud(req: Request, res: Response): Promise<void>;
  generarConDatosGenericos(req: Request, res: Response): Promise<void>;
  guardarSolicitud(req: Request, res: Response): Promise<void>;
}

export const pdfController: IPdfController = {
  generarSolicitud: async (req: Request, res: Response): Promise<void> => {
    try {
      const datos = req.body as DatosSolicitudPDF;

      if (!datos.numeroSolicitud || !datos.solicitante || !datos.detalles?.length) {
        res.status(400).json({
          message: "numeroSolicitud, solicitante y detalles son obligatorios",
        });
        return;
      }

      const result = pdfService.generarSolicitud(datos);

      if (!result.success) {
        res.status(500).json({ message: result.message });
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=solicitud_${datos.numeroSolicitud}.pdf`);
      res.send(Buffer.from(result.pdfBytes!));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  generarConDatosGenericos: async (_req: Request, res: Response): Promise<void> => {
    try {
      const datosGenericos = pdfService.generarDatosGenericos();

      const result = pdfService.generarSolicitud(datosGenericos);

      if (!result.success) {
        res.status(500).json({ message: result.message });
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=solicitud_ejemplo.pdf`);
      res.send(Buffer.from(result.pdfBytes!));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  guardarSolicitud: async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombreArchivo } = req.body as { nombreArchivo?: string };
      const datos = req.body as DatosSolicitudPDF;

      if (!datos.numeroSolicitud || !datos.solicitante || !datos.detalles?.length) {
        res.status(400).json({
          message: "numeroSolicitud, solicitante y detalles son obligatorios",
        });
        return;
      }

      const result = await pdfService.guardarPdf(datos, nombreArchivo);

      if (!result.success) {
        res.status(500).json({ message: result.message });
        return;
      }

      res.json({
        message: 'PDF guardado exitosamente',
        filePath: result.filePath,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
