import bcrypt from "bcrypt";
import { Usuario } from "../models/Usuario";
import { Area } from "../models/Area";

export const crearUsuario = async (data: any) => {
    const { nombre, email, password, rol, areaId } = data;

    if (!nombre || !email || !password || !rol || !areaId) {
        throw new Error("Todos los campos son obligatorios");
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) throw new Error("Ya existe un usuario con ese email");

    const hashedPassword = bcrypt.hashSync(password, 10);

    const usuario = await Usuario.create({
        nombre,
        email,
        password: hashedPassword,
        rol,
        areaId,
        activo: true
    });

    const usuarioLimpio = usuario.toJSON();
    delete usuarioLimpio.password;
    return usuarioLimpio;
};

export const obtenerUsuarios = async () => {
    return await Usuario.findAll({
        where: { activo: true },                    // ←←← ESTO FALTABA
        include: [{ model: Area, attributes: ["id", "nombre"] }],
        attributes: { exclude: ["password"] },
        order: [["nombre", "ASC"]],
    });
};

export const obtenerUsuariosInactivos = async () => {
    return await Usuario.findAll({
        where: { activo: false },                   // ←←← ESTO FALTABA
        include: [{ model: Area, attributes: ["id", "nombre"] }],
        attributes: { exclude: ["password"] },
        order: [["nombre", "ASC"]],
    });
};

export const obtenerUsuarioPorId = async (id: number) => {
    const usuario = await Usuario.findByPk(id, {
        include: [{ model: Area, attributes: ["id", "nombre"] }],
        attributes: { exclude: ["password"] },
    });
    if (!usuario) throw new Error("Usuario no encontrado");
    return usuario;
};

export const actualizarUsuario = async (id: number, data: any) => {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) throw new Error("Usuario no encontrado");

    const updateData: any = {
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        areaId: data.areaId,
    };

    if (data.password && data.password.trim() !== "") {
        updateData.password = bcrypt.hashSync(data.password, 10);
    }

    await usuario.update(updateData);

    const usuarioActualizado = usuario.toJSON();
    delete usuarioActualizado.password;
    return usuarioActualizado;
};

export const desactivarUsuario = async (id: number) => {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    await usuario.update({ activo: false });
    return { message: "Usuario desactivado correctamente" };
};

export const reactivarUsuario = async (id: number) => {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    await usuario.update({ activo: true });
    return { message: "Usuario reactivado correctamente" };
};