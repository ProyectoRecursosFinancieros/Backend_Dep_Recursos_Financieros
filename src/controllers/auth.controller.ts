import { Request, Response } from "express";
import { loginUsuario } from "../services/auth.service";

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
