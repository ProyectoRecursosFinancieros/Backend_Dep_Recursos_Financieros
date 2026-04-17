import { EstadoPago } from '../interfaces';

export interface OrdenPago {
  id: number;
  ordenCompraId: number;
  monto: number;
  estado: EstadoPago;
  autorizadoPorId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrdenPagoWithRelations extends OrdenPago {
  ordenCompra?: {
    id: number;
    numeroOrden: string;
    total: number;
  };
  autorizadoPor?: {
    id: number;
    nombre: string;
  };
}

export interface CreateOrdenPagoData {
  ordenCompraId: number;
  monto: number;
  estado?: EstadoPago;
  autorizadoPorId?: number;
}

export class OrdenPagoRepository {
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

  async findAll(): Promise<OrdenPagoWithRelations[]> {
    const sql = `
      SELECT op.*,
             oc.numeroOrden as orden_compra_numero, oc.total as orden_compra_total,
             u.nombre as autorizado_por_nombre
      FROM ordenes_pago op
      LEFT JOIN ordenes_compra oc ON op.ordenCompraId = oc.id
      LEFT JOIN usuarios u ON op.autorizadoPorId = u.id
      ORDER BY op.createdAt DESC;
    `;
    const results = await this.queryAsync<any>(sql);
    return this.mapRelations(results);
  }

  async findById(id: number): Promise<OrdenPago | null> {
    const sql = 'SELECT * FROM ordenes_pago WHERE id = ?;';
    const results = await this.queryAsync<OrdenPago>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async findByIdWithRelations(id: number): Promise<OrdenPagoWithRelations | null> {
    const sql = `
      SELECT op.*,
             oc.numeroOrden as orden_compra_numero, oc.total as orden_compra_total,
             u.nombre as autorizado_por_nombre
      FROM ordenes_pago op
      LEFT JOIN ordenes_compra oc ON op.ordenCompraId = oc.id
      LEFT JOIN usuarios u ON op.autorizadoPorId = u.id
      WHERE op.id = ?;
    `;
    const results = await this.queryAsync<any>(sql, [id]);
    if (results.length === 0) return null;
    return this.mapRelations(results)[0];
  }

  async findByOrdenCompraId(ordenCompraId: number): Promise<OrdenPago | null> {
    const sql = 'SELECT * FROM ordenes_pago WHERE ordenCompraId = ?;';
    const results = await this.queryAsync<OrdenPago>(sql, [ordenCompraId]);
    return results.length > 0 ? results[0] : null;
  }

  async findByEstado(estado: EstadoPago): Promise<OrdenPagoWithRelations[]> {
    const sql = `
      SELECT op.*,
             oc.numeroOrden as orden_compra_numero, oc.total as orden_compra_total,
             u.nombre as autorizado_por_nombre
      FROM ordenes_pago op
      LEFT JOIN ordenes_compra oc ON op.ordenCompraId = oc.id
      LEFT JOIN usuarios u ON op.autorizadoPorId = u.id
      WHERE op.estado = ?
      ORDER BY op.createdAt DESC;
    `;
    const results = await this.queryAsync<any>(sql, [estado]);
    return this.mapRelations(results);
  }

  async getOrdenCompra(ordenCompraId: number): Promise<{ id: number; total: number } | null> {
    const sql = 'SELECT id, total FROM ordenes_compra WHERE id = ?;';
    const results = await this.queryAsync<{ id: number; total: number }>(sql, [ordenCompraId]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data: CreateOrdenPagoData): Promise<OrdenPago> {
    const sql = `
      INSERT INTO ordenes_pago (ordenCompraId, monto, estado, autorizadoPorId)
      VALUES (?, ?, ?, ?);
    `;
    const result = await this.runAsync(sql, [
      data.ordenCompraId,
      data.monto,
      data.estado || EstadoPago.PENDIENTE,
      data.autorizadoPorId || null,
    ]);

    return this.findById(result.lastID) as Promise<OrdenPago>;
  }

  async updateEstado(id: number, estado: EstadoPago): Promise<OrdenPago | null> {
    const sql = 'UPDATE ordenes_pago SET estado = ? WHERE id = ?;';
    await this.runAsync(sql, [estado, id]);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const sql = 'DELETE FROM ordenes_pago WHERE id = ?;';
    await this.runAsync(sql, [id]);
  }

  private mapRelations(results: any[]): OrdenPagoWithRelations[] {
    return results.map(row => ({
      id: row.id,
      ordenCompraId: row.ordenCompraId,
      monto: row.monto,
      estado: row.estado,
      autorizadoPorId: row.autorizadoPorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ordenCompra: row.orden_compra_numero ? {
        id: row.ordenCompraId,
        numeroOrden: row.orden_compra_numero,
        total: row.orden_compra_total,
      } : undefined,
      autorizadoPor: row.autorizado_por_nombre ? {
        id: row.autorizadoPorId,
        nombre: row.autorizado_por_nombre,
      } : undefined,
    }));
  }
}
