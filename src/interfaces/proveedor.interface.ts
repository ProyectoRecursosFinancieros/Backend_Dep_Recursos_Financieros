export enum TipoPersona {
  FISICA = "FISICA",
  MORAL = "MORAL",
}

export interface IProveedor {
  id?: number;
  nombre: string;
  rfc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipoPersona: TipoPersona;
  activo?: boolean;
}

export interface IProveedorCreate {
  nombre: string;
  rfc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipoPersona: TipoPersona;
  activo?: boolean;
}

export interface IProveedorUpdate {
  nombre?: string;
  rfc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipoPersona?: TipoPersona;
  activo?: boolean;
}
