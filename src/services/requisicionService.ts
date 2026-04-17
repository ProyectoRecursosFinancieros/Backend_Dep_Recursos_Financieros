import { db } from "../config/db";
import { RequisicionRepository, Requisicion, RequisicionWithRelations, RequisicionDetalle } from "../repository/RequisicionRepository";
import { EstadoRequisicion, IRequisicionCreate, IRequisicionDetalleInput } from "../interfaces";

export interface RequisicionResult {
  success: boolean;
  message: string;
  data?: Requisicion | RequisicionWithRelations;
}

class RequisicionService {
  private requisicionRepository: RequisicionRepository;

  constructor() {
    this.requisicionRepository = new RequisicionRepository(db);
  }

  private calcularTotales(detalles: IRequisicionDetalleInput[]): { detallesProcesados: RequisicionDetalle[], total: number } {
    let total = 0;
    
    const detallesProcesados: RequisicionDetalle[] = detalles.map((d) => {
      const subtotal = Number(d.cantidad) * Number(d.precioUnitario);
      const impuestos = Number(d.impuestos || 0);
      const retenciones = Number(d.retenciones || 0);
      const totalLinea = subtotal + impuestos - retenciones;
      
      total += totalLinea;

      return {
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal,
        impuestos,
        retenciones,
      };
    });

    return { detallesProcesados, total };
  }

  public async crear(data: IRequisicionCreate): Promise<RequisicionResult> {
    try {
      if (!data.solicitudId || !data.presupuestoId || !data.detalles?.length) {
        return { success: false, message: "solicitudId, presupuestoId y detalles son obligatorios" };
      }

      const { detallesProcesados, total } = this.calcularTotales(data.detalles);

      const result = await this.requisicionRepository.create({
        solicitudId: data.solicitudId,
        presupuestoId: data.presupuestoId,
        total,
        estado: EstadoRequisicion.PENDIENTE,
        detalles: detallesProcesados,
      });

      return {
        success: true,
        message: "Requisición creada exitosamente",
        data: result,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al crear requisición" };
    }
  }

  public async autorizar(requisicionId: number, usuarioId: number): Promise<RequisicionResult> {
    try {
      const requisicion = await this.requisicionRepository.findById(requisicionId);

      if (!requisicion) {
        return { success: false, message: "Requisición no encontrada" };
      }

      if (requisicion.estado !== EstadoRequisicion.PENDIENTE) {
        return { success: false, message: "La requisición no está pendiente" };
      }

      const presupuesto = await this.requisicionRepository.getPresupuesto(requisicion.presupuestoId);
      if (!presupuesto) {
        return { success: false, message: "Presupuesto no encontrado" };
      }

      const disponible = Number(presupuesto.montoAprobado) - Number(presupuesto.montoEjercido);
      
      if (disponible < Number(requisicion.total)) {
        return { success: false, message: "Saldo insuficiente en presupuesto" };
      }

      const result = await this.requisicionRepository.autorizar(requisicionId, usuarioId);

      return {
        success: true,
        message: "Requisición autorizada exitosamente",
        data: result,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al autorizar requisición" };
    }
  }

  public async cancelar(requisicionId: number): Promise<RequisicionResult> {
    try {
      const requisicion = await this.requisicionRepository.findById(requisicionId);

      if (!requisicion) {
        return { success: false, message: "Requisición no encontrada" };
      }

      if (requisicion.estado !== EstadoRequisicion.AUTORIZADA) {
        return { success: false, message: "Solo se pueden cancelar requisiciones autorizadas" };
      }

      const result = await this.requisicionRepository.cancelar(requisicionId);

      return {
        success: true,
        message: "Requisición cancelada exitosamente",
        data: result,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al cancelar requisición" };
    }
  }

  public async obtenerTodas(): Promise<RequisicionWithRelations[]> {
    return this.requisicionRepository.findAll();
  }

  public async obtenerPorId(id: number): Promise<RequisicionResult> {
    try {
      const requisicion = await this.requisicionRepository.findByIdWithRelations(id);

      if (!requisicion) {
        return { success: false, message: "Requisición no encontrada" };
      }

      return {
        success: true,
        message: "Requisición encontrada",
        data: requisicion,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al obtener requisición" };
    }
  }

  public async obtenerPorEstado(estado: EstadoRequisicion): Promise<RequisicionWithRelations[]> {
    return this.requisicionRepository.findByEstado(estado);
  }

  public async obtenerPorSolicitud(solicitudId: number): Promise<Requisicion[]> {
    return this.requisicionRepository.findBySolicitudId(solicitudId);
  }
}

export const requisicionService = new RequisicionService();
