export interface IPresupuestoAnual {
  id?: number;
  anio: number;
  areaId: number;
  partidaId: number;
  montoAprobado: number;
  montoEjercido?: number;
}

export interface IPresupuestoAnualCreate {
  anio: number;
  areaId: number;
  partidaId: number;
  montoAprobado: number;
}

export interface IPresupuestoAnualUpdate {
  montoAprobado?: number;
  montoEjercido?: number;
}
