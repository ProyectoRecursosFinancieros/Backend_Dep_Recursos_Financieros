import { Database } from 'duckdb';
import {UserLevel} from '../interfaces/niveles'

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  level: UserLevel;
}

// 2. La Clase Repositorio
export class UserRepository {
  private db: Database;

  constructor(dbConnection: Database) {
    this.db = dbConnection;
  }

  /**
   * Método privado para manejar las consultas con Promesas (async/await)
   */
  private queryAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, ...params, (err: any, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res as T[]);
        }
      });
    });
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAll(): Promise<User[]> {
    console.log('Repositorio: Buscando todos los usuarios...');
    return this.queryAsync<User>('SELECT * FROM users;');
  }

  /**
   * Busca un usuario por su ID
   */
  async findById(id: string): Promise<User | null> {
    console.log(`Repositorio: Buscando usuario por ID [${id}]`);
    const users = await this.queryAsync<User>('SELECT * FROM users WHERE id = ?;', [id]);
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Busca un usuario por su username
   */
  async findByUsername(username: string): Promise<User | null> {
    console.log(`Repositorio: Buscando usuario por username [${username}]`);
    const users = await this.queryAsync<User>('SELECT * FROM users WHERE username = ?;', [username]);
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Obtiene todos los usuarios de un nivel específico
   */
  async findByLevel(level: UserLevel): Promise<User[]> {
    console.log(`Repositorio: Buscando usuarios con nivel [${level}]`);
    return this.queryAsync<User>('SELECT * FROM users WHERE level = ?;', [level]);
  }
}