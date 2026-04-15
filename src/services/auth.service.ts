// src/services/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario";
import { Area } from "../models/Area";

export const loginUsuario = async (email: string, password: string) => {

  const usuario = await Usuario.findOne({
    where: { email },
    include: [{ model: Area, attributes: ['id', 'nombre'] }],
  });

  if (!usuario) {
    throw new Error("El correo electrónico no está registrado");
  }

  if (!usuario.activo) {
    throw new Error("La cuenta ha sido desactivada. Contacta al administrador.");
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);

  if (!passwordValida) {
    throw new Error("La contraseña es incorrecta");
  }

  // Usuario limpio sin contraseña
  const usuarioLimpio = usuario.toJSON();
  delete usuarioLimpio.password;

  const token = jwt.sign(
    {
      id: usuario.id,
      rol: usuario.rol,
      areaId: usuario.areaId,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  );

  return {
    token,
    usuario: usuarioLimpio,
  };
};