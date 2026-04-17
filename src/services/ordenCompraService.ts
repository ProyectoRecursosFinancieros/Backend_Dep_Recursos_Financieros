import { db } from "../config/db";
import { OrdenCompraRepository, OrdenCompra, OrdenCompraWithRelations } from "../repository/OrdenCompraRepository";
import { IOrdenCompraCreate, TipoContratacion } from "../interfaces";

export interface OrdenCompraResult {
  success: boolean;
  message: string;
  data?: OrdenCompra | OrdenCompraWithRelations;
}

class OrdenCompraService {
  private ordenCompraRepository: OrdenCompraRepository;

  constructor() {
    this.ordenCompraRepository = new OrdenCompraRepository(db);
  }

  private generarNumeroOrden(): string {
    return `OC-${Date.now()}`;
  }

  public async crear(data: IOrdenCompraCreate): Promise<OrdenCompraResult> {
    try {
      if (!data.requisicionId || !data.proveedorId || !data.tipoContratacion) {
        return { success: false, message: "requisicionId, proveedorId y tipoContratacion son obligatorios" };
      }

      if (!Object.values(TipoContratacion).includes(data.tipoContratacion)) {
        return { success: false, message: "Tipo de contratación inválido" };
      }

      const requisicion = await this.ordenCompraRepository.getRequisicion(data.requisicionId);
      if (!requisicion) {
        return { success: false, message: "Requisición no encontrada" };
      }

      if (requisicion.estado !== "AUTORIZADA") {
        return { success: false, message: "La requisición debe estar AUTORIZADA" };
      }

      const ordenExistente = await this.ordenCompraRepository.findByRequisicionId(data.requisicionId);
      if (ordenExistente) {
        return { success: false, message: "Ya existe una orden de compra para esta requisición" };
      }

      const proveedor = await this.ordenCompraRepository.getProveedor(data.proveedorId);
      if (!proveedor) {
        return { success: false, message: "Proveedor no encontrado" };
      }

      if (!proveedor.activo) {
        return { success: false, message: "El proveedor está inactivo" };
      }

      const numeroOrden = this.generarNumeroOrden();

      const result = await this.ordenCompraRepository.create({
        numeroOrden,
        requisicionId: data.requisicionId,
        proveedorId: data.proveedorId,
        tipoContratacion: data.tipoContratacion,
        total: requisicion.total,
      });

      return {
        success: true,
        message: "Orden de compra creada exitosamente",
        data: result,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al crear orden de compra" };
    }
  }

  public async obtenerTodos(): Promise<OrdenCompraWithRelations[]> {
    return this.ordenCompraRepository.findAll();
  }

  public async obtenerPorId(id: number): Promise<OrdenCompraResult> {
    try {
      const orden = await this.ordenCompraRepository.findByIdWithRelations(id);

      if (!orden) {
        return { success: false, message: "Orden de compra no encontrada" };
      }

      return {
        success: true,
        message: "Orden de compra encontrada",
        data: orden,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al obtener orden de compra" };
    }
  }

  public async obtenerPorRequisicion(requisicionId: number): Promise<OrdenCompraResult> {
    try {
      const orden = await this.ordenCompraRepository.findByRequisicionId(requisicionId);

      if (!orden) {
        return { success: false, message: "No se encontró orden de compra para esta requisición" };
      }

      return {
        success: true,
        message: "Orden de compra encontrada",
        data: orden,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al obtener orden de compra" };
    }
  }
}

export const ordenCompraService = new OrdenCompraService();
