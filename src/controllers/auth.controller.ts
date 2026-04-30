import { Request, Response } from "express";
import { loginUsuario } from "../services/auth.service";
import { Usuario } from "../models/Usuario";
import { Area } from "../models/Area";
import { AuthRequest } from "../middlewares/auth.middleware";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y password son obligatorios",
      });
    }

    const result = await loginUsuario(email, password);

    return res.json(result);
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const usuario = await Usuario.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Area, attributes: ['id', 'nombre'] }]
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
