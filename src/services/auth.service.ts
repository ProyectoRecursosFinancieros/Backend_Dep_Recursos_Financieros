import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario";

export const loginUsuario = async (email: string, password: string) => {
  const usuario = await Usuario.findOne({
    where: { email },
  });

  if (!usuario) {
    throw new Error("Credenciales inválidas");
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);

  if (!passwordValida) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      rol: usuario.rol,
      areaId: usuario.areaId,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "8h",
    },
  );

  return {
    token,
  };
};
