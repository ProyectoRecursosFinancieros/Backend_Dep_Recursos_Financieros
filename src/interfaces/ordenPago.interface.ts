export enum EstadoPago {
  PENDIENTE = "PENDIENTE",
  PAGADO = "PAGADO",
  CANCELADO = "CANCELADO",
}

export interface IOrdenPago {
  id?: number;
  ordenCompraId: number;
  monto: number;
  estado?: EstadoPago;
  autorizadoPorId?: number;
}

export interface IOrdenPagoCreate {
  monto: number;
}
