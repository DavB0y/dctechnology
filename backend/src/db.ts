import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import path from 'path';

export interface IDatabase {
  get(sql: string, params?: any[]): Promise<any>;
  all(sql: string, params?: any[]): Promise<any[]>;
  run(sql: string, params?: any[]): Promise<any>;
}

class SQLiteWrapper implements IDatabase {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }
  async get(sql: string, params: any[] = []): Promise<any> {
    return this.db.get(sql, params);
  }
  async all(sql: string, params: any[] = []): Promise<any[]> {
    return this.db.all(sql, params);
  }
  async run(sql: string, params: any[] = []): Promise<any> {
    return this.db.run(sql, params);
  }
}

class PostgresWrapper implements IDatabase {
  private pool: pg.Pool;
  constructor(connectionString: string) {
    // Vercel Postgres requiere SSL en producción
    const ssl = connectionString.includes('localhost') ? false : { rejectUnauthorized: false };
    this.pool = new pg.Pool({
      connectionString,
      ssl
    });
  }

  private convertSql(sql: string): string {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const res = await this.pool.query(this.convertSql(sql), params);
    return res.rows[0];
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    const res = await this.pool.query(this.convertSql(sql), params);
    return res.rows;
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    return this.pool.query(this.convertSql(sql), params);
  }
}

let dbInstance: IDatabase | null = null;
let isPostgresMode = false;

export async function getDb(): Promise<IDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const pgConnectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (pgConnectionString) {
    console.log('Conectando a base de datos PostgreSQL (Modo Producción en la nube)...');
    dbInstance = new PostgresWrapper(pgConnectionString);
    isPostgresMode = true;
  } else {
    console.log('Conectando a base de datos SQLite (Modo Desarrollo local)...');
    const dbPath = path.join(__dirname, '..', 'database.db');
    const sqliteDb = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    dbInstance = new SQLiteWrapper(sqliteDb);
    isPostgresMode = false;
  }

  await initDb(dbInstance, isPostgresMode);
  return dbInstance;
}

async function initDb(db: IDatabase, isPostgres: boolean) {
  if (isPostgres) {
    // Tablas para Postgres
    await db.run(`
      CREATE TABLE IF NOT EXISTS admin (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS certifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        icon VARCHAR(255) NOT NULL,
        year VARCHAR(255) NOT NULL,
        link TEXT NOT NULL
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        rating REAL NOT NULL,
        likes INTEGER DEFAULT 0,
        verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(255) DEFAULT 'En espera',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
  } else {
    // Tablas para SQLite
    await db.run('PRAGMA foreign_keys = ON');

    await db.run(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        icon TEXT NOT NULL,
        year TEXT NOT NULL,
        link TEXT NOT NULL
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        text TEXT NOT NULL,
        rating REAL NOT NULL,
        likes INTEGER DEFAULT 0,
        verified INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'En espera',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
  }

  // Semillar datos si están vacías las tablas
  await seedAdmin(db);
  await seedCertifications(db);
  await seedTestimonials(db);
  await seedSettings(db);
}

async function seedAdmin(db: IDatabase) {
  const adminCount = await db.get('SELECT COUNT(*) as count FROM admin');
  if (parseInt(adminCount.count) === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO admin (username, password) VALUES (?, ?)', ['admin', passwordHash]);
    console.log('Semilla de Admin creada con éxito (usuario: admin, contraseña: admin123)');
  }
}

async function seedCertifications(db: IDatabase) {
  const certCount = await db.get('SELECT COUNT(*) as count FROM certifications');
  if (parseInt(certCount.count) === 0) {
    const certs = [
      { title: "IT Essentials 7.01", icon: "dvr", year: "2025", link: "https://drive.google.com/file/d/18-gl_RgVuCx2RYEFFhhP6HeIS3uAXSnF/view?usp=sharing" },
      { title: "Conceptos Básicos de Hardware", icon: "memory", year: "2025", link: "https://drive.google.com/file/d/19T4ouhesPyQnHj0PNnpAmLGaHO9Spe45/view?usp=sharing" },
      { title: "Conciencia digital", icon: "visibility", year: "2025", link: "https://drive.google.com/file/d/1i6I9xdnzw9ASyrviNQtjrbdJ_VX3fRsj/view?usp=sharing" },
      { title: "Introducción a la Ciberseguridad", icon: "shield_lock", year: "2025", link: "https://drive.google.com/file/d/1UKJ65frqiR8y8_d0gILqJ7NYH0pmVS1b/view?usp=drive_link" },
      { title: "Conceptos Básicos de Redes", icon: "router", year: "2025", link: "https://drive.google.com/file/d/1MY37JTXxkLN7iFsawlc4JGSY58RrUU0u/view?usp=drive_link" },
      { title: "Introducción a la IA Moderna", icon: "smart_toy", year: "2025", link: "https://drive.google.com/file/d/18CHjTUQzwSyR-Xn6sKbhNBrd6RxQO7X0/view?usp=drive_link" }
    ];

    for (const cert of certs) {
      await db.run(
        'INSERT INTO certifications (title, icon, year, link) VALUES (?, ?, ?, ?)',
        [cert.title, cert.icon, cert.year, cert.link]
      );
    }
    console.log('Semilla de Certificaciones creada con éxito.');
  }
}

async function seedTestimonials(db: IDatabase) {
  const testimonialsCount = await db.get('SELECT COUNT(*) as count FROM testimonials');
  if (parseInt(testimonialsCount.count) === 0) {
    const defaultReviews = [
      { name: "Carla Rosario.", role: "Estudiante", text: "Mi laptop estaba bastante lenta para las clases y después de revisarla y hacerle unos ajustes quedó mucho más rápida", rating: 4, likes: 12 },
      { name: "María Lucia.", role: "Emprendedora", text: "Necesitaba hacer respaldo de información y pasar todo a la nube y me ayudó en el proceso dejando todo bien organizado", rating: 4.5, likes: 8 },
      { name: "Jorge Pereira.", role: "Usuario", text: "No sabía bien qué componentes elegir y me orientó sin hacerme gastar de más dejando todo funcionando bien", rating: 4.5, likes: 15 },
      { name: "Luis Manuel.", role: "Marketing", text: "Instaló y configuró los equipos del área y se notó la mejora en el rendimiento desde el primer día", rating: 4, likes: 10 },
      { name: "Andrea Collasos.", role: "Administradora", text: "Me ayudó con respaldos y a mejorar el rendimiento del equipo dejando todo funcionando mejor y sin perder información", rating: 4, likes: 14 },
      { name: "Pedro Galvez.", role: "Emprendedor", text: "Tenía problemas con la red y algunos equipos y lo revisó dejando todo funcionando de forma más estable", rating: 4.5, likes: 11 },
      { name: "Carlos Torrez.", role: "Contador", text: "El sistema contable estaba lento y me hacía perder tiempo pero después del soporte el equipo respondió mucho mejor", rating: 4.5, likes: 18 },
      { name: "Daniela Vargas.", role: "Diseñadora", text: "Tenía problemas con algunos programas y ya llevaba tiempo así pero lo revisó y quedaron funcionando sin errores", rating: 4, likes: 9 },
      { name: "Camila Fernanda.", role: "Diseñadora", text: "Mi laptop no soportaba programas pesados y ahora funciona mucho mejor", rating: 4.5, likes: 13 },
      { name: "Javier Rodriguez", role: "Dueño de negocio", text: "Teníamos problemas con la red y después del soporte quedó mucho más estable", rating: 4.5, likes: 14 },
      { name: "Aldahir Bayona", role: "Enfermero", text: "El servicio fue excelente, desde el inicio de compra hasta la instalación de los programas y todo quedó funcionando sin problemas.", rating: 5, likes: 12 }
    ];

    for (const rev of defaultReviews) {
      await db.run(
        'INSERT INTO testimonials (name, role, text, rating, likes, verified) VALUES (?, ?, ?, ?, ?, 1)',
        [rev.name, rev.role, rev.text, rev.rating, rev.likes]
      );
    }
    console.log('Semilla de Testimonios creada con éxito.');
  }
}

async function seedSettings(db: IDatabase) {
  const settingsCount = await db.get('SELECT COUNT(*) as count FROM settings');
  if (parseInt(settingsCount.count) === 0) {
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [
      'cv_link', 
      'https://drive.google.com/drive/folders/1R6oFeoR-65Gh0DsZZB69O790z0MLYSKw?usp=sharing'
    ]);
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [
      'certifications_folder_link', 
      'https://drive.google.com/drive/folders/1BFiPUtz5ASF2YF3Yvbrau53uua3M92_N?usp=sharing'
    ]);
    console.log('Semilla de Ajustes (CV y carpeta de Certificados) creada con éxito.');
  }
}
