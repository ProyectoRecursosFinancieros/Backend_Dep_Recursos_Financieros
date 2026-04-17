import { db } from "../config/db";
import { PartidaPresupuestalRepository, PartidaPresupuestal } from "../repository/PartidaPresupuestalRepository";
import { IPartidaPresupuestalCreate, IPartidaPresupuestalUpdate } from "../interfaces";

export interface PartidaPresupuestalResult {
  success: boolean;
  message: string;
  data?: PartidaPresupuestal;
}

class PartidaPresupuestalService {
  private partidaRepository: PartidaPresupuestalRepository;

  constructor() {
    this.partidaRepository = new PartidaPresupuestalRepository(db);
  }

  public async crear(data: IPartidaPresupuestalCreate): Promise<PartidaPresupuestalResult> {
    try {
      if (!data.codigo || !data.nombre) {
        return { success: false, message: "codigo y nombre son obligatorios" };
      }

      const existente = await this.partidaRepository.findByCodigo(data.codigo);
      if (existente) {
        return { success: false, message: "Ya existe una partida con ese código" };
      }

      const result = await this.partidaRepository.create({
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        activa: data.activa !== undefined ? data.activa : true,
      });

      return {
        success: true,
        message: "Partida presupuestal creada exitosamente",
        data: result,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al crear partida" };
    }
  }

  public async obtenerTodos(): Promise<PartidaPresupuestal[]> {
    return this.partidaRepository.findAll(true);
  }

  public async obtenerInactivos(): Promise<PartidaPresupuestal[]> {
    return this.partidaRepository.findAll(false);
  }

  public async obtenerPorId(id: number): Promise<PartidaPresupuestalResult> {
    try {
      const partida = await this.partidaRepository.findById(id);

      if (!partida) {
        return { success: false, message: "Partida presupuestal no encontrada" };
      }

      return {
        success: true,
        message: "Partida encontrada",
        data: partida,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al obtener partida" };
    }
  }

  public async actualizar(id: number, data: IPartidaPresupuestalUpdate): Promise<PartidaPresupuestalResult> {
    try {
      const partida = await this.partidaRepository.findById(id);

      if (!partida) {
        return { success: false, message: "Partida presupuestal no encontrada" };
      }

      if (data.codigo && data.codigo !== partida.codigo) {
        const existente = await this.partidaRepository.findByCodigo(data.codigo);
        if (existente) {
          return { success: false, message: "Ya existe una partida con ese código" };
        }
      }

      const result = await this.partidaRepository.update(id, data);

      return {
        success: true,
        message: "Partida actualizada exitosamente",
        data: result!,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al actualizar partida" };
    }
  }

  public async desactivar(id: number): Promise<PartidaPresupuestalResult> {
    try {
      const partida = await this.partidaRepository.findById(id);

      if (!partida) {
        return { success: false, message: "Partida presupuestal no encontrada" };
      }

      if (!partida.activa) {
        return { success: false, message: "La partida ya está desactivada" };
      }

      await this.partidaRepository.setActivo(id, false);

      return {
        success: true,
        message: "Partida desactivada correctamente",
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al desactivar partida" };
    }
  }

  public async reactivar(id: number): Promise<PartidaPresupuestalResult> {
    try {
      const partida = await this.partidaRepository.findById(id);

      if (!partida) {
        return { success: false, message: "Partida presupuestal no encontrada" };
      }

      if (partida.activa) {
        return { success: false, message: "La partida ya está activa" };
      }

      await this.partidaRepository.setActivo(id, true);

      return {
        success: true,
        message: "Partida reactivada correctamente",
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al reactivar partida" };
    }
  }
}

export const partidaPresupuestalService = new PartidaPresupuestalService();
