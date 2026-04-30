import { Area } from "../models/Area";

export const crearArea = async (data: any) => {
    const { nombre } = data;
    if (!nombre) throw new Error("El nombre del área es obligatorio");

    return await Area.create({
        nombre: nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
    });
};

export const obtenerAreas = async () => {
    return await Area.findAll({
        order: [["nombre", "ASC"]],
    });
};

export const obtenerAreaPorId = async (id: number) => {
    const area = await Area.findByPk(id);
    if (!area) throw new Error("Área no encontrada");
    return area;
};

export const actualizarArea = async (id: number, data: any) => {
    const area = await Area.findByPk(id);
    if (!area) throw new Error("Área no encontrada");

    await area.update({
        nombre: data.nombre?.trim(),
        descripcion: data.descripcion?.trim() || null,
    });

    return area;
};