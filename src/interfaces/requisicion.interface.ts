export enum EstadoRequisicion {
  PENDIENTE = "PENDIENTE",
  AUTORIZADA = "AUTORIZADA",
  CANCELADA = "CANCELADA",
}

export interface IRequisicionDetalle {
  id?: number;
  requisicionId?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  impuestos?: number;
  retenciones?: number;
}

export interface IRequisicion {
  id?: number;
  solicitudId: number;
  presupuestoId: number;
  total?: number;
  estado?: EstadoRequisicion;
  autorizadoPorId?: number;
  fechaAutorizacion?: Date;
}

export interface IRequisicionCreate {
  solicitudId: number;
  presupuestoId: number;
  detalles: IRequisicionDetalle[];
}

export interface IRequisicionDetalleInput {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  impuestos?: number;
  retenciones?: number;
}
