export enum TipoContratacion {
  DIRECTA = "DIRECTA",
  INVITACION = "INVITACION",
  LICITACION = "LICITACION",
}

export interface IOrdenCompra {
  id?: number;
  numeroOrden: string;
  requisicionId: number;
  proveedorId: number;
  tipoContratacion: TipoContratacion;
  total: number;
}

export interface IOrdenCompraCreate {
  requisicionId: number;
  proveedorId: number;
  tipoContratacion: TipoContratacion;
}
