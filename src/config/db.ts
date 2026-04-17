import { Sequelize } from 'sequelize';
import duckdb from 'duckdb';
import colors from 'colors';

const dbType = process.env.DB_TYPE || 'mysql'; // 'mysql' o 'duckdb'

let database: any;
let duckDBConnection: any;

if (dbType === 'duckdb') {
  // Configuración para DuckDB (In-memory o archivo local)
  const db = new duckdb.Database( './dummy.db'); 
  duckDBConnection = db.connect();
  console.log(colors.yellow.bold("Modo DuckDB activado"));
} else {
  // Configuración original de Sequelize
  database = new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USER!,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        ssl: {
          rejectUnauthorized: true
        }
      }
    },
  );
}

export const connectDatabase = async () => {
  try {
    if (dbType === 'duckdb') {
      // DuckDB no usa .authenticate(), probamos una consulta simple
      await new Promise((resolve, reject) => {
        duckDBConnection.all('SELECT 1', (err: any, res: any) => {
          if (err) reject(err);
          resolve(res);
        });
      });
    } else {
      await database.authenticate();
      await database.sync();
    }

    console.log(
      colors.magenta.italic.bold(`Base de datos (${dbType}) conectada exitosamente!`),
    );
  } catch (error) {
    console.error(colors.red("Error al conectar la BD:"), error);
  }
};

export const db = dbType === 'duckdb' ? duckDBConnection : database;