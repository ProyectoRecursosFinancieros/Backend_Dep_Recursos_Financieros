import { db } from "../config/db";
import { ProveedorRepository, Proveedor, CreateProveedorData } from "../repository/ProveedorRepository";
import { IProveedorCreate, IProveedorUpdate, TipoPersona } from "../interfaces";

export interface ProveedorResult {
  success: boolean;
  message: string;
  data?: Proveedor;
}

class ProveedorService {
  private proveedorRepository: ProveedorRepository;

  constructor() {
    this.proveedorRepository = new ProveedorRepository(db);
  }

  public async crear(data: IProveedorCreate): Promise<ProveedorResult> {
    try {
      if (!data.nombre || !data.rfc || !data.tipoPersona) {
        return { success: false, message: "nombre, rfc y tipoPersona son obligatorios" };
      }

      if (!Object.values(TipoPersona).includes(data.tipoPersona)) {
        return { success: false, message: "tipoPersona debe ser FISICA o MORAL" };
      }

      const existente = await this.proveedorRepository.findByRfc(data.rfc);
      if (existente) {
        return { success: false, message: "Ya existe un proveedor con ese RFC" };
      }

      const result = await this.proveedorRepository.create({
        nombre: data.nombre,
        rfc: data.rfc,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        tipoPersona: data.tipoPersona,
        activo: data.activo !== undefined ? data.activo : true,
      });

      return {
        success: true,
        message: "Proveedor creado exitosamente",
        data: result,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al crear proveedor" };
    }
  }

  public async obtenerTodos(): Promise<Proveedor[]> {
    return this.proveedorRepository.findAll(true);
  }

  public async obtenerInactivos(): Promise<Proveedor[]> {
    return this.proveedorRepository.findAll(false);
  }

  public async obtenerPorId(id: number): Promise<ProveedorResult> {
    try {
      const proveedor = await this.proveedorRepository.findById(id);

      if (!proveedor) {
        return { success: false, message: "Proveedor no encontrado" };
      }

      return {
        success: true,
        message: "Proveedor encontrado",
        data: proveedor,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al obtener proveedor" };
    }
  }

  public async actualizar(id: number, data: IProveedorUpdate): Promise<ProveedorResult> {
    try {
      const proveedor = await this.proveedorRepository.findById(id);

      if (!proveedor) {
        return { success: false, message: "Proveedor no encontrado" };
      }

      if (data.tipoPersona && !Object.values(TipoPersona).includes(data.tipoPersona)) {
        return { success: false, message: "tipoPersona debe ser FISICA o MORAL" };
      }

      if (data.rfc && data.rfc !== proveedor.rfc) {
        const existente = await this.proveedorRepository.findByRfc(data.rfc);
        if (existente) {
          return { success: false, message: "Ya existe un proveedor con ese RFC" };
        }
      }

      const result = await this.proveedorRepository.update(id, data);

      return {
        success: true,
        message: "Proveedor actualizado exitosamente",
        data: result!,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al actualizar proveedor" };
    }
  }

  public async desactivar(id: number): Promise<ProveedorResult> {
    try {
      const proveedor = await this.proveedorRepository.findById(id);

      if (!proveedor) {
        return { success: false, message: "Proveedor no encontrado" };
      }

      if (!proveedor.activo) {
        return { success: false, message: "El proveedor ya está desactivado" };
      }

      await this.proveedorRepository.setActivo(id, false);

      return {
        success: true,
        message: "Proveedor desactivado correctamente",
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al desactivar proveedor" };
    }
  }

  public async reactivar(id: number): Promise<ProveedorResult> {
    try {
      const proveedor = await this.proveedorRepository.findById(id);

      if (!proveedor) {
        return { success: false, message: "Proveedor no encontrado" };
      }

      if (proveedor.activo) {
        return { success: false, message: "El proveedor ya está activo" };
      }

      await this.proveedorRepository.setActivo(id, true);

      return {
        success: true,
        message: "Proveedor reactivado correctamente",
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al reactivar proveedor" };
    }
  }
}

export const proveedorService = new ProveedorService();
