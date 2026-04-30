import { Request, Response } from "express";
import * as usuarioService from "../services/usuario.service";

export const crearUsuario = async (req: Request, res: Response) => {
    try {
        const usuario = await usuarioService.crearUsuario(req.body);
        res.status(201).json(usuario);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const obtenerUsuarios = async (_req: Request, res: Response) => {
    try {
        const usuarios = await usuarioService.obtenerUsuarios();
        res.json(usuarios);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const obtenerUsuariosInactivos = async (_req: Request, res: Response) => {
    try {
        const usuarios = await usuarioService.obtenerUsuariosInactivos();
        res.json(usuarios);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const usuario = await usuarioService.obtenerUsuarioPorId(id);
        res.json(usuario);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const actualizarUsuario = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const usuario = await usuarioService.actualizarUsuario(id, req.body);
        res.json(usuario);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const desactivarUsuario = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await usuarioService.desactivarUsuario(id);
        res.json(result);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const reactivarUsuario = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await usuarioService.reactivarUsuario(id);
        res.json(result);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};