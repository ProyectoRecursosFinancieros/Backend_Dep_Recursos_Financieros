import { TipoContratacion } from '../interfaces';

export interface OrdenCompra {
  id: number;
  numeroOrden: string;
  requisicionId: number;
  proveedorId: number;
  tipoContratacion: TipoContratacion;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrdenCompraWithRelations extends OrdenCompra {
  requisicion?: {
    id: number;
    estado: string;
    total: number;
  };
  proveedor?: {
    id: number;
    nombre: string;
    rfc: string;
  };
}

export interface CreateOrdenCompraData {
  numeroOrden: string;
  requisicionId: number;
  proveedorId: number;
  tipoContratacion: TipoContratacion;
  total: number;
}

export class OrdenCompraRepository {
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

  async findAll(): Promise<OrdenCompraWithRelations[]> {
    const sql = `
      SELECT oc.*,
             r.estado as requisicion_estado, r.total as requisicion_total,
             p.nombre as proveedor_nombre, p.rfc as proveedor_rfc
      FROM ordenes_compra oc
      LEFT JOIN requisiciones r ON oc.requisicionId = r.id
      LEFT JOIN proveedores p ON oc.proveedorId = p.id
      ORDER BY oc.createdAt DESC;
    `;
    const results = await this.queryAsync<any>(sql);
    return this.mapRelations(results);
  }

  async findById(id: number): Promise<OrdenCompra | null> {
    const sql = 'SELECT * FROM ordenes_compra WHERE id = ?;';
    const results = await this.queryAsync<OrdenCompra>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async findByIdWithRelations(id: number): Promise<OrdenCompraWithRelations | null> {
    const sql = `
      SELECT oc.*,
             r.estado as requisicion_estado, r.total as requisicion_total,
             p.nombre as proveedor_nombre, p.rfc as proveedor_rfc
      FROM ordenes_compra oc
      LEFT JOIN requisiciones r ON oc.requisicionId = r.id
      LEFT JOIN proveedores p ON oc.proveedorId = p.id
      WHERE oc.id = ?;
    `;
    const results = await this.queryAsync<any>(sql, [id]);
    if (results.length === 0) return null;
    return this.mapRelations(results)[0];
  }

  async findByRequisicionId(requisicionId: number): Promise<OrdenCompra | null> {
    const sql = 'SELECT * FROM ordenes_compra WHERE requisicionId = ?;';
    const results = await this.queryAsync<OrdenCompra>(sql, [requisicionId]);
    return results.length > 0 ? results[0] : null;
  }

  async getRequisicion(requisicionId: number): Promise<{ id: number; estado: string; total: number } | null> {
    const sql = 'SELECT id, estado, total FROM requisiciones WHERE id = ?;';
    const results = await this.queryAsync<{ id: number; estado: string; total: number }>(sql, [requisicionId]);
    return results.length > 0 ? results[0] : null;
  }

  async getProveedor(proveedorId: number): Promise<{ id: number; activo: boolean } | null> {
    const sql = 'SELECT id, activo FROM proveedores WHERE id = ?;';
    const results = await this.queryAsync<{ id: number; activo: boolean }>(sql, [proveedorId]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data: CreateOrdenCompraData): Promise<OrdenCompra> {
    const sql = `
      INSERT INTO ordenes_compra (numeroOrden, requisicionId, proveedorId, tipoContratacion, total)
      VALUES (?, ?, ?, ?, ?);
    `;
    const result = await this.runAsync(sql, [
      data.numeroOrden,
      data.requisicionId,
      data.proveedorId,
      data.tipoContratacion,
      data.total,
    ]);

    return this.findById(result.lastID) as Promise<OrdenCompra>;
  }

  async delete(id: number): Promise<void> {
    const sql = 'DELETE FROM ordenes_compra WHERE id = ?;';
    await this.runAsync(sql, [id]);
  }

  private mapRelations(results: any[]): OrdenCompraWithRelations[] {
    return results.map(row => ({
      id: row.id,
      numeroOrden: row.numeroOrden,
      requisicionId: row.requisicionId,
      proveedorId: row.proveedorId,
      tipoContratacion: row.tipoContratacion,
      total: row.total,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      requisicion: row.requisicion_estado ? {
        id: row.requisicionId,
        estado: row.requisicion_estado,
        total: row.requisicion_total,
      } : undefined,
      proveedor: row.proveedor_nombre ? {
        id: row.proveedorId,
        nombre: row.proveedor_nombre,
        rfc: row.proveedor_rfc,
      } : undefined,
    }));
  }
}
