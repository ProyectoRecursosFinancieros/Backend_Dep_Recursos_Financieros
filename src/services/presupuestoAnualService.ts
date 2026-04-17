import { db } from "../config/db";
import { PresupuestoAnualRepository, PresupuestoAnual, PresupuestoAnualWithRelations } from "../repository/PresupuestoAnualRepository";
import { IPresupuestoAnualCreate, IPresupuestoAnualUpdate } from "../interfaces";

export interface PresupuestoAnualResult {
  success: boolean;
  message: string;
  data?: PresupuestoAnual | PresupuestoAnualWithRelations;
}

class PresupuestoAnualService {
  private presupuestoRepository: PresupuestoAnualRepository;

  constructor() {
    this.presupuestoRepository = new PresupuestoAnualRepository(db);
  }

  public async crear(data: IPresupuestoAnualCreate): Promise<PresupuestoAnualResult> {
    try {
      if (!data.anio || !data.areaId || !data.partidaId || !data.montoAprobado) {
        return { success: false, message: "anio, areaId, partidaId y montoAprobado son obligatorios" };
      }

      const existente = await this.presupuestoRepository.findByAreaAnioPartida(
        data.anio,
        data.areaId,
        data.partidaId
      );

      if (existente) {
        return { success: false, message: "Ya existe presupuesto para esta área y partida en ese año" };
      }

      const result = await this.presupuestoRepository.create({
        anio: data.anio,
        areaId: data.areaId,
        partidaId: data.partidaId,
        montoAprobado: data.montoAprobado,
        montoEjercido: 0,
      });

      return {
        success: true,
        message: "Presupuesto creado exitosamente",
        data: result,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al crear presupuesto" };
    }
  }

  public async obtenerTodos(): Promise<PresupuestoAnualWithRelations[]> {
    return this.presupuestoRepository.findAll();
  }

  public async obtenerPorId(id: number): Promise<PresupuestoAnualResult> {
    try {
      const presupuesto = await this.presupuestoRepository.findByIdWithRelations(id);

      if (!presupuesto) {
        return { success: false, message: "Presupuesto no encontrado" };
      }

      return {
        success: true,
        message: "Presupuesto encontrado",
        data: presupuesto,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al obtener presupuesto" };
    }
  }

  public async obtenerPorAnio(anio: number): Promise<PresupuestoAnualWithRelations[]> {
    return this.presupuestoRepository.findByAnio(anio);
  }

  public async obtenerPorArea(areaId: number): Promise<PresupuestoAnualWithRelations[]> {
    return this.presupuestoRepository.findByArea(areaId);
  }

  public async actualizarMontoAprobado(id: number, montoAprobado: number): Promise<PresupuestoAnualResult> {
    try {
      const presupuesto = await this.presupuestoRepository.findById(id);

      if (!presupuesto) {
        return { success: false, message: "Presupuesto no encontrado" };
      }

      if (montoAprobado < 0) {
        return { success: false, message: "El monto aprobado no puede ser negativo" };
      }

      const result = await this.presupuestoRepository.updateMontoAprobado(id, montoAprobado);

      return {
        success: true,
        message: "Monto aprobado actualizado exitosamente",
        data: result!,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al actualizar monto aprobado" };
    }
  }

  public async actualizar(id: number, data: IPresupuestoAnualUpdate): Promise<PresupuestoAnualResult> {
    try {
      const presupuesto = await this.presupuestoRepository.findById(id);

      if (!presupuesto) {
        return { success: false, message: "Presupuesto no encontrado" };
      }

      if (data.montoAprobado !== undefined && data.montoAprobado < 0) {
        return { success: false, message: "El monto aprobado no puede ser negativo" };
      }

      if (data.montoEjercido !== undefined && data.montoEjercido < 0) {
        return { success: false, message: "El monto ejercido no puede ser negativo" };
      }

      const result = await this.presupuestoRepository.update(id, data);

      return {
        success: true,
        message: "Presupuesto actualizado exitosamente",
        data: result!,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al actualizar presupuesto" };
    }
  }

  public async obtenerSaldoDisponible(id: number): Promise<{ success: boolean; message?: string; saldo?: number }> {
    try {
      const presupuesto = await this.presupuestoRepository.findById(id);

      if (!presupuesto) {
        return { success: false, message: "Presupuesto no encontrado" };
      }

      const saldo = Number(presupuesto.montoAprobado) - Number(presupuesto.montoEjercido);

      return {
        success: true,
        saldo,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al calcular saldo" };
    }
  }
}

export const presupuestoAnualService = new PresupuestoAnualService();
