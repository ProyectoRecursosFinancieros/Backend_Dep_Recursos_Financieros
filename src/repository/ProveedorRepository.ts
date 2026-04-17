import { TipoPersona } from '../interfaces';

export interface Proveedor {
  id: number;
  nombre: string;
  rfc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipoPersona: TipoPersona;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProveedorData {
  nombre: string;
  rfc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipoPersona: TipoPersona;
  activo?: boolean;
}

export class ProveedorRepository {
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

  async findAll(activo: boolean = true): Promise<Proveedor[]> {
    const sql = activo
      ? 'SELECT * FROM proveedores WHERE activo = true ORDER BY nombre ASC;'
      : 'SELECT * FROM proveedores WHERE activo = false ORDER BY nombre ASC;';
    return this.queryAsync<Proveedor>(sql);
  }

  async findById(id: number): Promise<Proveedor | null> {
    const sql = 'SELECT * FROM proveedores WHERE id = ?;';
    const results = await this.queryAsync<Proveedor>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async findByRfc(rfc: string): Promise<Proveedor | null> {
    const sql = 'SELECT * FROM proveedores WHERE rfc = ?;';
    const results = await this.queryAsync<Proveedor>(sql, [rfc]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data: CreateProveedorData): Promise<Proveedor> {
    const sql = `
      INSERT INTO proveedores (nombre, rfc, direccion, telefono, email, tipoPersona, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const result = await this.runAsync(sql, [
      data.nombre,
      data.rfc,
      data.direccion || null,
      data.telefono || null,
      data.email || null,
      data.tipoPersona,
      data.activo !== undefined ? data.activo : true,
    ]);

    return this.findById(result.lastID) as Promise<Proveedor>;
  }

  async update(id: number, data: Partial<CreateProveedorData>): Promise<Proveedor | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) { fields.push('nombre = ?'); values.push(data.nombre); }
    if (data.rfc !== undefined) { fields.push('rfc = ?'); values.push(data.rfc); }
    if (data.direccion !== undefined) { fields.push('direccion = ?'); values.push(data.direccion); }
    if (data.telefono !== undefined) { fields.push('telefono = ?'); values.push(data.telefono); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.tipoPersona !== undefined) { fields.push('tipoPersona = ?'); values.push(data.tipoPersona); }
    if (data.activo !== undefined) { fields.push('activo = ?'); values.push(data.activo); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const sql = `UPDATE proveedores SET ${fields.join(', ')} WHERE id = ?;`;
    await this.runAsync(sql, values);

    return this.findById(id);
  }

  async setActivo(id: number, activo: boolean): Promise<Proveedor | null> {
    const sql = 'UPDATE proveedores SET activo = ? WHERE id = ?;';
    await this.runAsync(sql, [activo, id]);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const sql = 'DELETE FROM proveedores WHERE id = ?;';
    await this.runAsync(sql, [id]);
  }
}
