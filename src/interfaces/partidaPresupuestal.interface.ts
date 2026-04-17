export interface IPartidaPresupuestal {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

export interface IPartidaPresupuestalCreate {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

export interface IPartidaPresupuestalUpdate {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  activa?: boolean;
}
