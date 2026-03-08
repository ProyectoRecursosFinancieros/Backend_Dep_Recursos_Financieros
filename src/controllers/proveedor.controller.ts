import { Request, Response } from "express";
import * as proveedorService from "../services/proveedor.service";
import { TipoPersona } from "../models/Proveedor";

export const crearProveedor = async (req: Request, res: Response) => {
  try {
    const { nombre, rfc, direccion, telefono, email, tipoPersona } = req.body;

    if (!nombre || !rfc || !tipoPersona) {
      return res.status(400).json({
        message: "nombre, rfc y tipoPersona son obligatorios",
      });
    }

    if (!Object.values(TipoPersona).includes(tipoPersona)) {
      return res.status(400).json({
        message: "tipoPersona debe ser FISICA o MORAL",
      });
    }

    const proveedor = await proveedorService.crearProveedor({
      nombre,
      rfc,
      direccion,
      telefono,
      email,
      tipoPersona,
      activo: true,
    });

    res.status(201).json(proveedor);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const obtenerProveedores = async (_req: Request, res: Response) => {
  try {
    const proveedores = await proveedorService.obtenerProveedores();
    res.json(proveedores);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const obtenerProveedorPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const proveedor = await proveedorService.obtenerProveedorPorId(id);

    res.json(proveedor);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const actualizarProveedor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const proveedor = await proveedorService.actualizarProveedor(
      id,
      req.body
    );

    res.json(proveedor);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const obtenerProveedoresInactivos = async (_req: Request, res: Response) => {
  try {
    const proveedores = await proveedorService.obtenerProveedoresInactivos();
    res.json(proveedores);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const desactivarProveedor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await proveedorService.desactivarProveedor(id);

    res.json(result);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const reactivarProveedor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await proveedorService.reactivarProveedor(id);

    res.json(result);
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};