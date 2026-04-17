export enum RolUsuario {
  ADMIN = "ADMIN",
  PRESUPUESTO = "PRESUPUESTO",
  PLANEACION = "PLANEACION",
  MATERIALES = "MATERIALES",
  AREA = "AREA",
}

export interface IUsuario {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  rol: RolUsuario;
  areaId: number;
}

export interface IUsuarioCreate {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
  areaId: number;
}

export interface IUsuarioLogin {
  email: string;
  password: string;
}

export interface IArea {
  id?: number;
  nombre: string;
  descripcion?: string;
}
