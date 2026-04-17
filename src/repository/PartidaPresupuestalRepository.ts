export interface PartidaPresupuestal {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePartidaPresupuestalData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

export class PartidaPresupuestalRepository {
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

  async findAll(activa: boolean = true): Promise<PartidaPresupuestal[]> {
    const sql = activa
      ? 'SELECT * FROM partidas_presupuestales WHERE activa = true ORDER BY codigo ASC;'
      : 'SELECT * FROM partidas_presupuestales WHERE activa = false ORDER BY codigo ASC;';
    return this.queryAsync<PartidaPresupuestal>(sql);
  }

  async findById(id: number): Promise<PartidaPresupuestal | null> {
    const sql = 'SELECT * FROM partidas_presupuestales WHERE id = ?;';
    const results = await this.queryAsync<PartidaPresupuestal>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async findByCodigo(codigo: string): Promise<PartidaPresupuestal | null> {
    const sql = 'SELECT * FROM partidas_presupuestales WHERE codigo = ?;';
    const results = await this.queryAsync<PartidaPresupuestal>(sql, [codigo]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data: CreatePartidaPresupuestalData): Promise<PartidaPresupuestal> {
    const sql = `
      INSERT INTO partidas_presupuestales (codigo, nombre, descripcion, activa)
      VALUES (?, ?, ?, ?);
    `;
    const result = await this.runAsync(sql, [
      data.codigo,
      data.nombre,
      data.descripcion || null,
      data.activa !== undefined ? data.activa : true,
    ]);

    return this.findById(result.lastID) as Promise<PartidaPresupuestal>;
  }

  async update(id: number, data: Partial<CreatePartidaPresupuestalData>): Promise<PartidaPresupuestal | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.codigo !== undefined) { fields.push('codigo = ?'); values.push(data.codigo); }
    if (data.nombre !== undefined) { fields.push('nombre = ?'); values.push(data.nombre); }
    if (data.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(data.descripcion); }
    if (data.activa !== undefined) { fields.push('activa = ?'); values.push(data.activa); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const sql = `UPDATE partidas_presupuestales SET ${fields.join(', ')} WHERE id = ?;`;
    await this.runAsync(sql, values);

    return this.findById(id);
  }

  async setActivo(id: number, activa: boolean): Promise<PartidaPresupuestal | null> {
    const sql = 'UPDATE partidas_presupuestales SET activa = ? WHERE id = ?;';
    await this.runAsync(sql, [activa, id]);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const sql = 'DELETE FROM partidas_presupuestales WHERE id = ?;';
    await this.runAsync(sql, [id]);
  }
}
