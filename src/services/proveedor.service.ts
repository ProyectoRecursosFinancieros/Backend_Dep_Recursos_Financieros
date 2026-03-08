import { Proveedor } from "../models/Proveedor";

export const crearProveedor = async (data: any) => {
  return await Proveedor.create(data);
};

export const obtenerProveedores = async () => {
  return await Proveedor.findAll({
    where: { activo: true },
  });
};

export const obtenerProveedoresInactivos = async () => {
  return await Proveedor.findAll({
    where: { activo: false },
  });
};

export const obtenerProveedorPorId = async (id: number) => {
  const proveedor = await Proveedor.findByPk(id);

  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  return proveedor;
};

export const actualizarProveedor = async (id: number, data: any) => {
  const proveedor = await Proveedor.findByPk(id);

  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  await proveedor.update(data);
  return proveedor;
};

export const desactivarProveedor = async (id: number) => {
  const proveedor = await Proveedor.findByPk(id);

  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  await proveedor.update({ activo: false });

  return {
    message: "Proveedor desactivado correctamente",
  };
};

export const reactivarProveedor = async (id: number) => {
  const proveedor = await Proveedor.findByPk(id);

  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  await proveedor.update({ activo: true });

  return {
    message: "Proveedor reactivado correctamente",
  };
};