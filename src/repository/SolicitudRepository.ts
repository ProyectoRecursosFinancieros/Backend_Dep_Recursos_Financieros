import { EstadoSolicitud } from '../interfaces';

export interface Solicitud {
  id: number;
  folio: string;
  areaId: number;
  solicitanteId: number;
  descripcionGeneral: string;
  estado: EstadoSolicitud;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SolicitudWithRelations extends Solicitud {
  area?: {
    id: number;
    nombre: string;
  };
  solicitante?: {
    id: number;
    nombre: string;
    email: string;
  };
}

export interface CreateSolicitudData {
  areaId: number;
  solicitanteId: number;
  descripcionGeneral: string;
  folio: string;
  estado: EstadoSolicitud;
}

export class SolicitudRepository {
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

  private generarFolio(): string {
    return `SOL-${Date.now()}`;
  }

  async findAll(): Promise<SolicitudWithRelations[]> {
    const sql = `
      SELECT s.*,
             a.nombre as area_nombre,
             u.nombre as solicitante_nombre, u.email as solicitante_email
      FROM solicitudes s
      LEFT JOIN areas a ON s.areaId = a.id
      LEFT JOIN usuarios u ON s.solicitanteId = u.id
      ORDER BY s.createdAt DESC;
    `;
    const results = await this.queryAsync<any>(sql);
    return this.mapRelations(results);
  }

  async findById(id: number): Promise<Solicitud | null> {
    const sql = 'SELECT * FROM solicitudes WHERE id = ?;';
    const results = await this.queryAsync<Solicitud>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async findByIdWithRelations(id: number): Promise<SolicitudWithRelations | null> {
    const sql = `
      SELECT s.*,
             a.nombre as area_nombre,
             u.nombre as solicitante_nombre, u.email as solicitante_email
      FROM solicitudes s
      LEFT JOIN areas a ON s.areaId = a.id
      LEFT JOIN usuarios u ON s.solicitanteId = u.id
      WHERE s.id = ?;
    `;
    const results = await this.queryAsync<any>(sql, [id]);
    if (results.length === 0) return null;
    return this.mapRelations(results)[0];
  }

  async findByEstado(estado: EstadoSolicitud): Promise<SolicitudWithRelations[]> {
    const sql = `
      SELECT s.*,
             a.nombre as area_nombre,
             u.nombre as solicitante_nombre, u.email as solicitante_email
      FROM solicitudes s
      LEFT JOIN areas a ON s.areaId = a.id
      LEFT JOIN usuarios u ON s.solicitanteId = u.id
      WHERE s.estado = ?
      ORDER BY s.createdAt DESC;
    `;
    const results = await this.queryAsync<any>(sql, [estado]);
    return this.mapRelations(results);
  }

  async findBySolicitanteId(solicitanteId: number): Promise<SolicitudWithRelations[]> {
    const sql = `
      SELECT s.*,
             a.nombre as area_nombre,
             u.nombre as solicitante_nombre, u.email as solicitante_email
      FROM solicitudes s
      LEFT JOIN areas a ON s.areaId = a.id
      LEFT JOIN usuarios u ON s.solicitanteId = u.id
      WHERE s.solicitanteId = ?
      ORDER BY s.createdAt DESC;
    `;
    const results = await this.queryAsync<any>(sql, [solicitanteId]);
    return this.mapRelations(results);
  }

  async create(data: CreateSolicitudData): Promise<Solicitud> {
    const sql = `
      INSERT INTO solicitudes (folio, areaId, solicitanteId, descripcionGeneral, estado)
      VALUES (?, ?, ?, ?, ?);
    `;
    const result = await this.runAsync(sql, [
      data.folio,
      data.areaId,
      data.solicitanteId,
      data.descripcionGeneral,
      data.estado,
    ]);

    return this.findById(result.lastID) as Promise<Solicitud>;
  }

  async updateEstado(id: number, estado: EstadoSolicitud): Promise<Solicitud | null> {
    const sql = 'UPDATE solicitudes SET estado = ? WHERE id = ?;';
    await this.runAsync(sql, [estado, id]);
    return this.findById(id);
  }

  private mapRelations(results: any[]): SolicitudWithRelations[] {
    return results.map(row => ({
      id: row.id,
      folio: row.folio,
      areaId: row.areaId,
      solicitanteId: row.solicitanteId,
      descripcionGeneral: row.descripcionGeneral,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      area: row.area_nombre ? {
        id: row.areaId,
        nombre: row.area_nombre,
      } : undefined,
      solicitante: row.solicitante_nombre ? {
        id: row.solicitanteId,
        nombre: row.solicitante_nombre,
        email: row.solicitante_email,
      } : undefined,
    }));
  }
}
