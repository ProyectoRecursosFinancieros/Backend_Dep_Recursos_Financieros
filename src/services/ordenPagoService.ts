import { db } from "../config/db";
import { OrdenPagoRepository, OrdenPago, OrdenPagoWithRelations } from "../repository/OrdenPagoRepository";
import { EstadoPago, IOrdenPagoCreate } from "../interfaces";

export interface OrdenPagoResult {
  success: boolean;
  message: string;
  data?: OrdenPago | OrdenPagoWithRelations;
}

class OrdenPagoService {
  private ordenPagoRepository: OrdenPagoRepository;

  constructor() {
    this.ordenPagoRepository = new OrdenPagoRepository(db);
  }

  public async generar(ordenCompraId: number, usuarioId: number, monto: number): Promise<OrdenPagoResult> {
    try {
      if (!ordenCompraId) {
        return { success: false, message: "ordenCompraId es obligatorio" };
      }

      if (!monto || monto <= 0) {
        return { success: false, message: "El monto debe ser mayor a 0" };
      }

      const ordenCompra = await this.ordenPagoRepository.getOrdenCompra(ordenCompraId);
      if (!ordenCompra) {
        return { success: false, message: "Orden de compra no encontrada" };
      }

      const pagoExistente = await this.ordenPagoRepository.findByOrdenCompraId(ordenCompraId);
      if (pagoExistente) {
        return { success: false, message: "Ya existe una orden de pago para esta orden de compra" };
      }

      if (monto > ordenCompra.total) {
        return { success: false, message: "El monto no puede exceder el total de la orden" };
      }

      const result = await this.ordenPagoRepository.create({
        ordenCompraId,
        monto,
        estado: EstadoPago.PENDIENTE,
        autorizadoPorId: usuarioId,
      });

      return {
        success: true,
        message: "Orden de pago generada exitosamente",
        data: result,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al generar orden de pago" };
    }
  }

  public async obtenerTodos(): Promise<OrdenPagoWithRelations[]> {
    return this.ordenPagoRepository.findAll();
  }

  public async obtenerPorId(id: number): Promise<OrdenPagoResult> {
    try {
      const ordenPago = await this.ordenPagoRepository.findByIdWithRelations(id);

      if (!ordenPago) {
        return { success: false, message: "Orden de pago no encontrada" };
      }

      return {
        success: true,
        message: "Orden de pago encontrada",
        data: ordenPago,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al obtener orden de pago" };
    }
  }

  public async obtenerPorOrdenCompra(ordenCompraId: number): Promise<OrdenPagoResult> {
    try {
      const ordenPago = await this.ordenPagoRepository.findByOrdenCompraId(ordenCompraId);

      if (!ordenPago) {
        return { success: false, message: "No se encontró orden de pago para esta orden de compra" };
      }

      return {
        success: true,
        message: "Orden de pago encontrada",
        data: ordenPago,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al obtener orden de pago" };
    }
  }

  public async obtenerPorEstado(estado: EstadoPago): Promise<OrdenPagoWithRelations[]> {
    return this.ordenPagoRepository.findByEstado(estado);
  }

  public async marcarPagado(id: number): Promise<OrdenPagoResult> {
    try {
      const ordenPago = await this.ordenPagoRepository.findById(id);

      if (!ordenPago) {
        return { success: false, message: "Orden de pago no encontrada" };
      }

      if (ordenPago.estado !== EstadoPago.PENDIENTE) {
        return { success: false, message: "Solo se pueden marcar como pagadas ordenes en estado PENDIENTE" };
      }

      const result = await this.ordenPagoRepository.updateEstado(id, EstadoPago.PAGADO);

      return {
        success: true,
        message: "Orden de pago marcada como pagada",
        data: result!,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al marcar orden de pago como pagada" };
    }
  }

  public async cancelar(id: number): Promise<OrdenPagoResult> {
    try {
      const ordenPago = await this.ordenPagoRepository.findById(id);

      if (!ordenPago) {
        return { success: false, message: "Orden de pago no encontrada" };
      }

      if (ordenPago.estado === EstadoPago.PAGADO) {
        return { success: false, message: "No se pueden cancelar ordenes de pago ya pagadas" };
      }

      const result = await this.ordenPagoRepository.updateEstado(id, EstadoPago.CANCELADO);

      return {
        success: true,
        message: "Orden de pago cancelada",
        data: result!,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al cancelar orden de pago" };
    }
  }
}

export const ordenPagoService = new OrdenPagoService();
