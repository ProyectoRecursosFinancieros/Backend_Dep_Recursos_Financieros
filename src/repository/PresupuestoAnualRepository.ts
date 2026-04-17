export interface PresupuestoAnual {
  id: number;
  anio: number;
  areaId: number;
  partidaId: number;
  montoAprobado: number;
  montoEjercido: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PresupuestoAnualWithRelations extends PresupuestoAnual {
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

export interface CreatePresupuestoAnualData {
  anio: number;
  areaId: number;
  partidaId: number;
  montoAprobado: number;
  montoEjercido?: number;
}

export class PresupuestoAnualRepository {
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

  async findAll(): Promise<PresupuestoAnualWithRelations[]> {
    const sql = `
      SELECT pa.*,
             a.nombre as area_nombre,
             pp.nombre as partida_nombre, pp.codigo as partida_codigo
      FROM presupuestos_anuales pa
      LEFT JOIN areas a ON pa.areaId = a.id
      LEFT JOIN partidas_presupuestales pp ON pa.partidaId = pp.id
      ORDER BY pa.anio DESC, a.nombre ASC;
    `;
    const results = await this.queryAsync<any>(sql);
    return this.mapRelations(results);
  }

  async findById(id: number): Promise<PresupuestoAnual | null> {
    const sql = 'SELECT * FROM presupuestos_anuales WHERE id = ?;';
    const results = await this.queryAsync<PresupuestoAnual>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async findByIdWithRelations(id: number): Promise<PresupuestoAnualWithRelations | null> {
    const sql = `
      SELECT pa.*,
             a.nombre as area_nombre,
             pp.nombre as partida_nombre, pp.codigo as partida_codigo
      FROM presupuestos_anuales pa
      LEFT JOIN areas a ON pa.areaId = a.id
      LEFT JOIN partidas_presupuestales pp ON pa.partidaId = pp.id
      WHERE pa.id = ?;
    `;
    const results = await this.queryAsync<any>(sql, [id]);
    if (results.length === 0) return null;
    return this.mapRelations(results)[0];
  }

  async findByAnio(anio: number): Promise<PresupuestoAnualWithRelations[]> {
    const sql = `
      SELECT pa.*,
             a.nombre as area_nombre,
             pp.nombre as partida_nombre, pp.codigo as partida_codigo
      FROM presupuestos_anuales pa
      LEFT JOIN areas a ON pa.areaId = a.id
      LEFT JOIN partidas_presupuestales pp ON pa.partidaId = pp.id
      WHERE pa.anio = ?
      ORDER BY a.nombre ASC;
    `;
    const results = await this.queryAsync<any>(sql, [anio]);
    return this.mapRelations(results);
  }

  async findByArea(areaId: number): Promise<PresupuestoAnualWithRelations[]> {
    const sql = `
      SELECT pa.*,
             a.nombre as area_nombre,
             pp.nombre as partida_nombre, pp.codigo as partida_codigo
      FROM presupuestos_anuales pa
      LEFT JOIN areas a ON pa.areaId = a.id
      LEFT JOIN partidas_presupuestales pp ON pa.partidaId = pp.id
      WHERE pa.areaId = ?
      ORDER BY pa.anio DESC;
    `;
    const results = await this.queryAsync<any>(sql, [areaId]);
    return this.mapRelations(results);
  }

  async findByAreaAnioPartida(anio: number, areaId: number, partidaId: number): Promise<PresupuestoAnual | null> {
    const sql = 'SELECT * FROM presupuestos_anuales WHERE anio = ? AND areaId = ? AND partidaId = ?;';
    const results = await this.queryAsync<PresupuestoAnual>(sql, [anio, areaId, partidaId]);
    return results.length > 0 ? results[0] : null;
  }

  async create(data: CreatePresupuestoAnualData): Promise<PresupuestoAnual> {
    const sql = `
      INSERT INTO presupuestos_anuales (anio, areaId, partidaId, montoAprobado, montoEjercido)
      VALUES (?, ?, ?, ?, ?);
    `;
    const result = await this.runAsync(sql, [
      data.anio,
      data.areaId,
      data.partidaId,
      data.montoAprobado,
      data.montoEjercido || 0,
    ]);

    return this.findById(result.lastID) as Promise<PresupuestoAnual>;
  }

  async update(id: number, data: Partial<CreatePresupuestoAnualData>): Promise<PresupuestoAnual | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.anio !== undefined) { fields.push('anio = ?'); values.push(data.anio); }
    if (data.areaId !== undefined) { fields.push('areaId = ?'); values.push(data.areaId); }
    if (data.partidaId !== undefined) { fields.push('partidaId = ?'); values.push(data.partidaId); }
    if (data.montoAprobado !== undefined) { fields.push('montoAprobado = ?'); values.push(data.montoAprobado); }
    if (data.montoEjercido !== undefined) { fields.push('montoEjercido = ?'); values.push(data.montoEjercido); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const sql = `UPDATE presupuestos_anuales SET ${fields.join(', ')} WHERE id = ?;`;
    await this.runAsync(sql, values);

    return this.findById(id);
  }

  async updateMontoAprobado(id: number, montoAprobado: number): Promise<PresupuestoAnual | null> {
    const sql = 'UPDATE presupuestos_anuales SET montoAprobado = ? WHERE id = ?;';
    await this.runAsync(sql, [montoAprobado, id]);
    return this.findById(id);
  }

  async updateMontoEjercido(id: number, montoEjercido: number): Promise<PresupuestoAnual | null> {
    const sql = 'UPDATE presupuestos_anuales SET montoEjercido = ? WHERE id = ?;';
    await this.runAsync(sql, [montoEjercido, id]);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const sql = 'DELETE FROM presupuestos_anuales WHERE id = ?;';
    await this.runAsync(sql, [id]);
  }

  private mapRelations(results: any[]): PresupuestoAnualWithRelations[] {
    return results.map(row => ({
      id: row.id,
      anio: row.anio,
      areaId: row.areaId,
      partidaId: row.partidaId,
      montoAprobado: row.montoAprobado,
      montoEjercido: row.montoEjercido,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
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
