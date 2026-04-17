export enum EstadoSolicitud {
  BORRADOR = "BORRADOR",
  ENVIADA = "ENVIADA",
  AUTORIZADA = "AUTORIZADA",
  RECHAZADA = "RECHAZADA",
}

export interface ISolicitud {
  id?: number;
  folio?: string;
  areaId: number;
  solicitanteId: number;
  descripcionGeneral: string;
  estado?: EstadoSolicitud;
}

export interface ISolicitudCreate {
  areaId: number;
  descripcionGeneral: string;
  solicitanteId?: number;
}
