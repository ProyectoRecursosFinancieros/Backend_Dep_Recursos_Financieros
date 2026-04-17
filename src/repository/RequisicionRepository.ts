import { EstadoRequisicion, IRequisicion } from '../interfaces';

export interface RequisicionDetalle {
  id?: number;
  requisicionId?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  impuestos?: number;
  retenciones?: number;
}

export interface Requisicion {
  id: number;
  solicitudId: number;
  presupuestoId: number;
  total: number;
  estado: EstadoRequisicion;
  autorizadoPorId?: number;
  fechaAutorizacion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RequisicionWithRelations extends Requisicion {
  detalles?: RequisicionDetalle[];
  solicitante?: {
    id: number;
    nombre: string;
    email: string;
  };
  area?: {
    id: number;
    nombre: string;
  };
  partidaPresupuestal?: {
    id: number;
    nombre: string;
    codigo: string;
  };
}

export interface PresupuestoInfo {
  id: number;
  montoAprobado: number;
  montoEjercido: number;
}

export interface CreateRequisicionData {
  solicitudId: number;
  presupuestoId: number;
  total: number;
  estado: EstadoRequisicion;
  detalles: RequisicionDetalle[];
}

export class RequisicionRepository {
  private db: any;

  constructor(dbConnection: any) {
    this.db = dbConnection;
  }

  private queryAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, ...params, (err: any, res: any) => {
        if (err) reject(err);
        else resolve(res as T[]);
      });
    });
  }

  private runAsync(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...params, function(err: any) {
        if (err) reject(err);
        else resolve({ lastID: this.lastId, changes: this.changes });
      });
    });
  }

  async findAll(): Promise<RequisicionWithRelations[]> {
    const sql = `
      SELECT r.*, 
             s.nombre as solicitante_nombre, s.email as solicitante_email,
             a.nombre as area_nombre,
             p.nombre as partida_nombre, p.codigo as partida_codigo
      FROM requisiciones r
      LEFT JOIN solicitudes sol ON r.solicitudId = sol.id
      LEFT JOIN usuarios s ON sol.solicitanteId = s.id
      LEFT JOIN areas a ON sol.areaId = a.id
      LEFT JOIN presupuestos_anuales pa ON r.presupuestoId = pa.id
      LEFT JOIN partidas_presupuestales p ON pa.partidaId = p.id
      ORDER BY r.createdAt DESC;
    `;
    const results = await this.queryAsync<any>(sql);
    return this.mapRelations(results);
  }

  async findById(id: number): Promise<Requisicion | null> {
    const sql = 'SELECT * FROM requisiciones WHERE id = ?;';
    const results = await this.queryAsync<Requisicion>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async findByIdWithRelations(id: number): Promise<RequisicionWithRelations | null> {
    const sql = `
      SELECT r.*, 
             s.nombre as solicitante_nombre, s.email as solicitante_email,
             a.nombre as area_nombre,
             p.nombre as partida_nombre, p.codigo as partida_codigo
      FROM requisiciones r
      LEFT JOIN solicitudes sol ON r.solicitudId = sol.id
      LEFT JOIN usuarios s ON sol.solicitanteId = s.id
      LEFT JOIN areas a ON sol.areaId = a.id
      LEFT JOIN presupuestos_anuales pa ON r.presupuestoId = pa.id
      LEFT JOIN partidas_presupuestales p ON pa.partidaId = p.id
      WHERE r.id = ?;
    `;
    const results = await this.queryAsync<any>(sql, [id]);
    if (results.length === 0) return null;

    const requisicion = this.mapRelations(results)[0];
    requisicion.detalles = await this.getDetalles(id);
    return requisicion;
  }

  async findByEstado(estado: EstadoRequisicion): Promise<RequisicionWithRelations[]> {
    const sql = `
      SELECT r.*, 
             s.nombre as solicitante_nombre, s.email as solicitante_email,
             a.nombre as area_nombre,
             p.nombre as partida_nombre, p.codigo as partida_codigo
      FROM requisiciones r
      LEFT JOIN solicitudes sol ON r.solicitudId = sol.id
      LEFT JOIN usuarios s ON sol.solicitanteId = s.id
      LEFT JOIN areas a ON sol.areaId = a.id
      LEFT JOIN presupuestos_anuales pa ON r.presupuestoId = pa.id
      LEFT JOIN partidas_presupuestales p ON pa.partidaId = p.id
      WHERE r.estado = ?
      ORDER BY r.createdAt DESC;
    `;
    const results = await this.queryAsync<any>(sql, [estado]);
    return this.mapRelations(results);
  }

  async findBySolicitudId(solicitudId: number): Promise<Requisicion[]> {
    const sql = 'SELECT * FROM requisiciones WHERE solicitudId = ?;';
    return this.queryAsync<Requisicion>(sql, [solicitudId]);
  }

  async getPresupuesto(presupuestoId: number): Promise<PresupuestoInfo | null> {
    const sql = 'SELECT id, montoAprobado, montoEjercido FROM presupuestos_anuales WHERE id = ?;';
    const results = await this.queryAsync<PresupuestoInfo>(sql, [presupuestoId]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data: CreateRequisicionData): Promise<Requisicion> {
    const sql = `
      INSERT INTO requisiciones (solicitudId, presupuestoId, total, estado)
      VALUES (?, ?, ?, ?);
    `;
    const result = await this.runAsync(sql, [
      data.solicitudId,
      data.presupuestoId,
      data.total,
      data.estado,
    ]);

    const requisicionId = result.lastID;

    for (const detalle of data.detalles) {
      await this.crearDetalle(requisicionId, detalle);
    }

    return this.findById(requisicionId) as Promise<Requisicion>;
  }

  private async crearDetalle(requisicionId: number, detalle: RequisicionDetalle): Promise<void> {
    const sql = `
      INSERT INTO requisicion_detalles (requisicionId, descripcion, cantidad, precioUnitario, subtotal, impuestos, retenciones)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    await this.runAsync(sql, [
      requisicionId,
      detalle.descripcion,
      detalle.cantidad,
      detalle.precioUnitario,
      detalle.subtotal || 0,
      detalle.impuestos || 0,
      detalle.retenciones || 0,
    ]);
  }

  private async getDetalles(requisicionId: number): Promise<RequisicionDetalle[]> {
    const sql = 'SELECT * FROM requisicion_detalles WHERE requisicionId = ?;';
    return this.queryAsync<RequisicionDetalle>(sql, [requisicionId]);
  }

  async autorizar(requisicionId: number, usuarioId: number): Promise<Requisicion> {
    const sql = `
      UPDATE requisiciones 
      SET estado = ?, autorizadoPorId = ?, fechaAutorizacion = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    await this.runAsync(sql, [EstadoRequisicion.AUTORIZADA, usuarioId, requisicionId]);
    return this.findById(requisicionId) as Promise<Requisicion>;
  }

  async cancelar(requisicionId: number): Promise<Requisicion> {
    const sql = 'UPDATE requisiciones SET estado = ? WHERE id = ?;';
    await this.runAsync(sql, [EstadoRequisicion.CANCELADA, requisicionId]);
    return this.findById(requisicionId) as Promise<Requisicion>;
  }

  private mapRelations(results: any[]): RequisicionWithRelations[] {
    return results.map(row => ({
      id: row.id,
      solicitudId: row.solicitudId,
      presupuestoId: row.presupuestoId,
      total: row.total,
      estado: row.estado,
      autorizadoPorId: row.autorizadoPorId,
      fechaAutorizacion: row.fechaAutorizacion,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      solicitante: row.solicitante_nombre ? {
        id: row.solicitanteId,
        nombre: row.solicitante_nombre,
        email: row.solicitante_email,
      } : undefined,
      area: row.area_nombre ? {
        id: row.areaId,
        nombre: row.area_nombre,
      } : undefined,
      partidaPresupuestal: row.partida_nombre ? {
        id: row.partidaId,
        nombre: row.partida_nombre,
        codigo: row.partida_codigo,
      } : undefined,
    }));
  }
}
