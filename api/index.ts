// Función serverless auto-contenida para Vercel
// NO depende de sqlite3 (incompatible con entornos serverless)
// Usa datos en memoria con seed inicial. Si DATABASE_URL está configurada, usa PostgreSQL.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'DContreras123!';

app.use(cors());
app.use(express.json());

// ─── Auth Middleware ──────────────────────────────────────────────────────────
interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso no autorizado. Token no provisto.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

// ─── Base de datos: Postgres o en-memoria ─────────────────────────────────────

interface IDb {
  get(sql: string, params?: any[]): Promise<any>;
  all(sql: string, params?: any[]): Promise<any[]>;
  run(sql: string, params?: any[]): Promise<any>;
}

// ── Implementación en memoria ──────────────────────────────────────────────────
const hashAdmin = bcrypt.hashSync('admin123', 10);

const store = {
  admin: [{ id: 1, username: 'admin', password: hashAdmin }],
  certifications: [
    { id: 1, title: 'IT Essentials 7.01', icon: 'dvr', year: '2025', link: 'https://drive.google.com/file/d/18-gl_RgVuCx2RYEFFhhP6HeIS3uAXSnF/view?usp=sharing' },
    { id: 2, title: 'Conceptos Básicos de Hardware', icon: 'memory', year: '2025', link: 'https://drive.google.com/file/d/19T4ouhesPyQnHj0PNnpAmLGaHO9Spe45/view?usp=sharing' },
    { id: 3, title: 'Conciencia digital', icon: 'visibility', year: '2025', link: 'https://drive.google.com/file/d/1i6I9xdnzw9ASyrviNQtjrbdJ_VX3fRsj/view?usp=sharing' },
    { id: 4, title: 'Introducción a la Ciberseguridad', icon: 'shield_lock', year: '2025', link: 'https://drive.google.com/file/d/1UKJ65frqiR8y8_d0gILqJ7NYH0pmVS1b/view?usp=drive_link' },
    { id: 5, title: 'Conceptos Básicos de Redes', icon: 'router', year: '2025', link: 'https://drive.google.com/file/d/1MY37JTXxkLN7iFsawlc4JGSY58RrUU0u/view?usp=drive_link' },
    { id: 6, title: 'Introducción a la IA Moderna', icon: 'smart_toy', year: '2025', link: 'https://drive.google.com/file/d/18CHjTUQzwSyR-Xn6sKbhNBrd6RxQO7X0/view?usp=drive_link' },
  ],
  testimonials: [
    { id: 1,  name: 'Carla Rosario.',     role: 'Estudiante',         text: 'Mi laptop estaba bastante lenta para las clases y después de revisarla y hacerle unos ajustes quedó mucho más rápida', rating: 4,   likes: 12, verified: 1 },
    { id: 2,  name: 'María Lucia.',       role: 'Emprendedora',       text: 'Necesitaba hacer respaldo de información y pasar todo a la nube y me ayudó en el proceso dejando todo bien organizado', rating: 4.5, likes: 8,  verified: 1 },
    { id: 3,  name: 'Jorge Pereira.',     role: 'Usuario',            text: 'No sabía bien qué componentes elegir y me orientó sin hacerme gastar de más dejando todo funcionando bien', rating: 4.5, likes: 15, verified: 1 },
    { id: 4,  name: 'Luis Manuel.',       role: 'Marketing',          text: 'Instaló y configuró los equipos del área y se notó la mejora en el rendimiento desde el primer día', rating: 4,   likes: 10, verified: 1 },
    { id: 5,  name: 'Andrea Collasos.',   role: 'Administradora',     text: 'Me ayudó con respaldos y a mejorar el rendimiento del equipo dejando todo funcionando mejor y sin perder información', rating: 4, likes: 14, verified: 1 },
    { id: 6,  name: 'Pedro Galvez.',      role: 'Emprendedor',        text: 'Tenía problemas con la red y algunos equipos y lo revisó dejando todo funcionando de forma más estable', rating: 4.5, likes: 11, verified: 1 },
    { id: 7,  name: 'Carlos Torrez.',     role: 'Contador',           text: 'El sistema contable estaba lento y me hacía perder tiempo pero después del soporte el equipo respondió mucho mejor', rating: 4.5, likes: 18, verified: 1 },
    { id: 8,  name: 'Daniela Vargas.',    role: 'Diseñadora',         text: 'Tenía problemas con algunos programas y ya llevaba tiempo así pero lo revisó y quedaron funcionando sin errores', rating: 4, likes: 9, verified: 1 },
    { id: 9,  name: 'Lucía P.',           role: 'Emprendedora',       text: 'Me ayudó a elegir y configurar los equipos para mi trabajo y todo quedó funcionando sin problemas', rating: 4.5, likes: 12, verified: 1 },
    { id: 10, name: 'Patricia M.',        role: 'Usuario',            text: 'Los equipos estaban lentos y después de la optimización mejoraron bastante en el uso diario', rating: 4, likes: 11, verified: 1 },
    { id: 11, name: 'Andrea F.',          role: 'Marketing Digital',  text: 'Después de la optimización los programas cargan mucho más rápido y se notó bastante la diferencia', rating: 4, likes: 9, verified: 1 },
    { id: 12, name: 'Luis A.',            role: 'Arquitecto',         text: 'Me ayudó a mejorar el rendimiento de mi equipo para trabajar con programas pesados y ahora corre mucho mejor', rating: 4.5, likes: 13, verified: 1 },
    { id: 13, name: 'Marcos D.',          role: 'Contador',           text: 'Me orientó con la configuración del entorno de trabajo y ahora todo funciona de forma más fluida', rating: 5, likes: 17, verified: 1 },
    { id: 14, name: 'Sofía C.',           role: 'Administrador',      text: 'Resolvió varios problemas técnicos en poco tiempo dejando todo funcionando correctamente', rating: 4, likes: 10, verified: 1 },
    { id: 15, name: 'Javier L.',          role: 'Empresario',         text: 'Teníamos problemas con la red en la oficina y ya estaba afectando el trabajo pero lo revisó y lo dejó funcionando mucho más estable', rating: 4.5, likes: 19, verified: 1 },
    { id: 16, name: 'Valeria H.',         role: 'Estudiante',         text: 'Me ayudó a recuperar archivos importantes de la universidad y además dejó la laptop funcionando mejor', rating: 4, likes: 7, verified: 1 },
    { id: 17, name: 'Miguel E.',          role: 'Logística',          text: 'Nos ayudó con la configuración de varios equipos en el área de logística y después de eso todo quedó funcionando bien', rating: 4.5, likes: 15, verified: 1 },
    { id: 18, name: 'Ricardo N.',         role: 'Abogado',            text: 'Tenía problemas con mi equipo de trabajo y después de la revisión quedó funcionando mucho mejor', rating: 4.5, likes: 9, verified: 1 },
    { id: 19, name: 'Diana M.',           role: 'Docente',            text: 'Mi laptop estaba fallando en clases y después del soporte volvió a funcionar sin problemas', rating: 4, likes: 6, verified: 1 },
    { id: 20, name: 'Oscar V.',           role: 'Administrador',      text: 'El equipo tenía errores constantes y después de revisarlo todo quedó más estable', rating: 4.5, likes: 12, verified: 1 },
    { id: 21, name: 'Natalia R.',         role: 'Emprendedora',       text: 'Me ayudó a organizar mis equipos de trabajo y ahora todo funciona mejor', rating: 4, likes: 8, verified: 1 },
    { id: 22, name: 'Kevin S.',           role: 'Estudiante',         text: 'Tenía problemas con mi laptop y después del soporte quedó funcionando bien', rating: 4.5, likes: 11, verified: 1 },
    { id: 23, name: 'Paola C.',           role: 'Administradora',     text: 'Los equipos de la oficina estaban lentos y después de la optimización mejoraron bastante', rating: 4, likes: 7, verified: 1 },
    { id: 24, name: 'Luis R.',            role: 'Contador',           text: 'El sistema iba lento y después de la revisión respondió mucho mejor', rating: 4.5, likes: 10, verified: 1 },
    { id: 25, name: 'Sandra G.',          role: 'Atención al cliente',text: 'Me ayudó con la configuración de los equipos y todo quedó funcionando correctamente', rating: 4, likes: 6, verified: 1 },
    { id: 26, name: 'Pedro L.',           role: 'Logística',          text: 'Había errores en varios equipos y después de revisarlos todo quedó estable', rating: 4.5, likes: 9, verified: 1 },
    { id: 27, name: 'Camila Fernanda.',   role: 'Diseñadora',         text: 'Mi laptop no soportaba programas pesados y ahora funciona mucho mejor', rating: 4.5, likes: 13, verified: 1 },
    { id: 28, name: 'Javier Rodriguez',  role: 'Dueño de negocio',   text: 'Teníamos problemas con la red y después del soporte quedó mucho más estable', rating: 4.5, likes: 14, verified: 1 },
    { id: 29, name: 'Andrea V.',          role: 'Estudiante',         text: 'La laptop estaba muy lenta y después del ajuste mejoró bastante', rating: 4, likes: 5, verified: 1 },
    { id: 30, name: 'Marco Pedrozo',      role: 'Emprendedor',        text: 'Me ayudó a optimizar mi equipo y ahora funciona mejor para el trabajo diario', rating: 4.5, likes: 10, verified: 1 },
    { id: 31, name: 'Luciana S.',         role: 'Emprendedora',       text: 'Me ayudó con la instalación y configuración y todo quedó funcionando bien', rating: 4, likes: 7, verified: 1 },
    { id: 32, name: 'Renzo Huallanca',    role: 'Usuario',            text: 'Tenía errores difíciles de detectar y después del soporte todo quedó resuelto', rating: 4.5, likes: 11, verified: 1 },
    { id: 33, name: 'Gabriela T.',        role: 'Docente',            text: 'Necesitaba que mi equipo funcione mejor para clases y ahora va mucho más fluido', rating: 4, likes: 6, verified: 1 },
    { id: 34, name: 'Fernando Lucio',     role: 'Administrador',      text: 'Los equipos estaban lentos y después del ajuste mejoraron bastante', rating: 4.5, likes: 9, verified: 1 },
    { id: 35, name: 'Claudia Benavides',  role: 'Contadora',          text: 'Me ayudó con la configuración del sistema y ahora funciona correctamente', rating: 4, likes: 8, verified: 1 },
    { id: 36, name: 'Diego A.',           role: 'Usuario',            text: 'Había fallos en el sistema y después de revisarlo todo quedó estable', rating: 4.5, likes: 12, verified: 1 },
    { id: 37, name: 'Rosa M.',            role: 'Emprendedora',       text: 'No sabía cómo configurar mis equipos de trabajo y me ayudó dejándolo todo listo', rating: 4, likes: 7, verified: 1 },
    { id: 38, name: 'Alberto Fausto.',    role: 'Logística',          text: 'Los equipos presentaban errores y después del soporte quedaron funcionando bien', rating: 4.5, likes: 10, verified: 1 },
    { id: 39, name: 'Valeria N.',         role: 'Estudiante',         text: 'Mi laptop tenía problemas y después de revisarla quedó mucho mejor', rating: 4, likes: 6, verified: 1 },
    { id: 40, name: 'Carlos M.',          role: 'Dueño de negocio',   text: 'Teníamos fallos en la red y después de la revisión quedó más estable', rating: 4.5, likes: 13, verified: 1 },
    { id: 41, name: 'Daniel R.',          role: 'Usuario',            text: 'Me ayudó con errores en mi equipo y ahora funciona sin problemas', rating: 4.5, likes: 11, verified: 1 },
    { id: 42, name: 'Patricia V.',        role: 'Administradora',     text: 'Los equipos estaban lentos y después del ajuste mejoraron bastante', rating: 4, likes: 7, verified: 1 },
    { id: 43, name: 'Miguel T.',          role: 'Marketing',          text: 'Me ayudó con la configuración y ahora todo funciona correctamente', rating: 4, likes: 6, verified: 1 },
    { id: 44, name: 'Luis F.',            role: 'Contador',           text: 'El sistema fallaba y después del soporte quedó mucho más estable', rating: 4.5, likes: 9, verified: 1 },
    { id: 45, name: 'Andrea Perez',       role: 'Diseñadora',         text: 'Mi laptop estaba lenta y ahora funciona mucho mejor para trabajar', rating: 4.5, likes: 12, verified: 1 },
    { id: 46, name: 'Jorge L.',           role: 'Usuario',            text: 'Había errores constantes y después del soporte quedaron resueltos', rating: 4.5, likes: 11, verified: 1 },
    { id: 47, name: 'Ana Rodriguez',      role: 'Estudiante',         text: 'Tenía problemas con mi laptop y después de revisarla quedó funcionando bien', rating: 4, likes: 5, verified: 1 },
    { id: 48, name: 'Marco V.',           role: 'Dueño de negocio',   text: 'La red fallaba y después del soporte quedó mucho más estable', rating: 4.5, likes: 13, verified: 1 },
    { id: 49, name: 'Lucía G.',           role: 'Docente',            text: 'Mi equipo no funcionaba bien y después de revisarlo quedó mucho mejor con el nuevo disco duro que mejoró la estabilidad', rating: 4, likes: 6, verified: 1 },
    { id: 50, name: 'Pedro Ramirez.',     role: 'Logística',          text: 'Los equipos tenían errores y después del soporte quedaron funcionando correctamente', rating: 4.5, likes: 10, verified: 1 },
    { id: 51, name: 'Camila N.',          role: 'Emprendedora',       text: 'Me ayudó con la configuración de mi laptop y ahora todo funciona sin problemas', rating: 4, likes: 7, verified: 1 },
    { id: 52, name: 'Diego Manuel',       role: 'Usuario',            text: 'Tenía problemas técnicos y después del soporte quedaron resueltos', rating: 4.5, likes: 12, verified: 1 },
    { id: 53, name: 'Ana Faúndez',        role: 'Administradora',     text: 'Los equipos estaban lentos y después de la optimización mejoraron bastante', rating: 4, likes: 6, verified: 1 },
    { id: 54, name: 'Luis Palacios',      role: 'Contador',           text: 'El sistema fallaba y después del soporte quedó funcionando mejor', rating: 4.5, likes: 9, verified: 1 },
    { id: 55, name: 'Alexia Mendoza',     role: 'Estudiante',         text: 'Mi laptop estaba lenta y ahora funciona mucho mejor', rating: 4, likes: 5, verified: 1 },
    { id: 56, name: 'Javier Salazar',     role: 'Dueño de negocio',   text: 'Había problemas con la red y después del soporte quedó estable', rating: 4.5, likes: 12, verified: 1 },
    { id: 57, name: 'Paola Rodriguez.',   role: 'Diseñadora',         text: 'Mi equipo tenía problemas y después del soporte quedó funcionando bien', rating: 4.5, likes: 11, verified: 1 },
    { id: 58, name: 'Marco Antonio',      role: 'Usuario',            text: 'Había errores constantes y después de revisarlo todo quedó estable', rating: 4.5, likes: 10, verified: 1 },
    { id: 59, name: 'Sofía Sanchez.',     role: 'Docente',            text: 'Mi laptop no funcionaba bien y después del soporte mejoró bastante', rating: 4, likes: 6, verified: 1 },
    { id: 60, name: 'Aldahir Bayona',     role: 'Enfermero',          text: 'El servicio fue excelente, desde el inicio de compra hasta la instalación de los programas y todo quedó funcionando sin problemas.', rating: 5, likes: 12, verified: 1 },
    { id: 61, name: 'Brandon Figueroa',   role: 'Estudiante',         text: 'Me brindó servicio rápido y asesoramiento para ampliar mi memoria RAM de PC y cambio de pasta térmica.', rating: 5, likes: 1, verified: 1 },
  ],
  contacts: [] as any[],
  settings: [
    { key: 'cv_link', value: 'https://drive.google.com/drive/folders/1R6oFeoR-65Gh0DsZZB69O790z0MLYSKw?usp=sharing' },
    { key: 'certifications_folder_link', value: 'https://drive.google.com/drive/folders/1BFiPUtz5ASF2YF3Yvbrau53uua3M92_N?usp=sharing' },
  ],
  nextId: { contacts: 1, testimonials: 62 },
};

class MemoryDb implements IDb {
  async get(sql: string, params: any[] = []): Promise<any> {
    const s = sql.trim().toLowerCase();

    if (s.includes('from admin')) {
      const username = params[0];
      return store.admin.find(a => a.username === username);
    }
    if (s.includes('count(*) as count from admin')) {
      return { count: store.admin.length.toString() };
    }
    if (s.includes('from certifications where id')) {
      const id = Number(params[0]);
      return store.certifications.find(c => c.id === id);
    }
    if (s.includes('from testimonials where id')) {
      const id = Number(params[0]);
      return store.testimonials.find(t => t.id === id);
    }
    if (s.includes('from contacts where id')) {
      const id = Number(params[0]);
      return store.contacts.find(c => c.id === id);
    }
    if (s.includes('from settings where key')) {
      const key = params[0];
      return store.settings.find(s2 => s2.key === key);
    }
    if (s.includes('count(*) as count from certifications')) {
      return { count: store.certifications.length.toString() };
    }
    if (s.includes('count(*) as count from testimonials')) {
      return { count: store.testimonials.length.toString() };
    }
    if (s.includes('count(*) as count from settings')) {
      return { count: store.settings.length.toString() };
    }
    return null;
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    const s = sql.trim().toLowerCase();
    if (s.includes('from certifications')) return [...store.certifications].reverse();
    if (s.includes('from testimonials')) return store.testimonials.filter(t => t.verified === 1).reverse();
    if (s.includes('from contacts')) return [...store.contacts].reverse();
    if (s.includes('from settings')) return [...store.settings];
    return [];
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    const s = sql.trim().toLowerCase();

    // UPDATE testimonials likes
    if (s.startsWith('update testimonials set likes')) {
      const id = Number(params[0]);
      const t = store.testimonials.find(t2 => t2.id === id);
      if (t) t.likes += 1;
      return;
    }
    // UPDATE certifications
    if (s.startsWith('update certifications')) {
      const [title, icon, year, link, id] = params;
      const c = store.certifications.find(c2 => c2.id === Number(id));
      if (c) { c.title = title; c.icon = icon; c.year = year; c.link = link; }
      return;
    }
    // UPDATE contacts status
    if (s.startsWith('update contacts set status')) {
      const [status, id] = params;
      const c = store.contacts.find(c2 => c2.id === Number(id));
      if (c) c.status = status;
      return;
    }
    // UPDATE settings
    if (s.startsWith('update settings set value')) {
      const [value, key] = params;
      const s2 = store.settings.find(s3 => s3.key === key);
      if (s2) s2.value = value;
      return;
    }
    // INSERT testimonials
    if (s.startsWith('insert into testimonials')) {
      const [name, role, text, rating, likes] = params;
      store.testimonials.push({ id: store.nextId.testimonials++, name, role, text, rating, likes: likes || 0, verified: 1 });
      return;
    }
    // INSERT contacts
    if (s.startsWith('insert into contacts')) {
      const [name, email, phone, message] = params;
      store.contacts.push({ id: store.nextId.contacts++, name, email, phone, message, status: 'En espera', created_at: new Date().toISOString() });
      return;
    }
    // INSERT settings
    if (s.startsWith('insert into settings')) {
      const [key, value] = params;
      if (!store.settings.find(s2 => s2.key === key)) store.settings.push({ key, value });
      return;
    }
    // Ignore CREATE TABLE / PRAGMA / other DDL
    return;
  }
}

// ── Implementación PostgreSQL ──────────────────────────────────────────────────
class PostgresDb implements IDb {
  private pool: pg.Pool;
  constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    });
  }
  private toPositional(sql: string): string {
    let i = 1;
    return sql.replace(/\?/g, () => `$${i++}`);
  }
  async get(sql: string, params: any[] = []): Promise<any> {
    const res = await this.pool.query(this.toPositional(sql), params);
    return res.rows[0];
  }
  async all(sql: string, params: any[] = []): Promise<any[]> {
    const res = await this.pool.query(this.toPositional(sql), params);
    return res.rows;
  }
  async run(sql: string, params: any[] = []): Promise<any> {
    return this.pool.query(this.toPositional(sql), params);
  }
}

// ── Seleccionar implementación ─────────────────────────────────────────────────
let _db: IDb | null = null;
async function getDb(): Promise<IDb> {
  if (_db) return _db;
  const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (pgUrl) {
    console.log('Usando PostgreSQL en producción...');
    const pgDb = new PostgresDb(pgUrl);
    // Crear tablas si no existen
    await pgDb.run(`CREATE TABLE IF NOT EXISTS admin (id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, password TEXT NOT NULL)`);
    await pgDb.run(`CREATE TABLE IF NOT EXISTS certifications (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, icon VARCHAR(255) NOT NULL, year VARCHAR(255) NOT NULL, link TEXT NOT NULL)`);
    await pgDb.run(`CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL, text TEXT NOT NULL, rating REAL NOT NULL, likes INTEGER DEFAULT 0, verified INTEGER DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pgDb.run(`CREATE TABLE IF NOT EXISTS contacts (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, message TEXT NOT NULL, status VARCHAR(255) DEFAULT 'En espera', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pgDb.run(`CREATE TABLE IF NOT EXISTS settings (key VARCHAR(255) PRIMARY KEY, value TEXT NOT NULL)`);
    // Seed admin
    const admin = await pgDb.get('SELECT COUNT(*) as count FROM admin');
    if (parseInt(admin?.count) === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await pgDb.run('INSERT INTO admin (username, password) VALUES (?, ?)', ['admin', hash]);
    }
    _db = pgDb;
  } else {
    console.log('Usando base de datos en memoria...');
    _db = new MemoryDb();
  }
  return _db;
}

// ─── RUTAS ────────────────────────────────────────────────────────────────────

// Auth
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) { res.status(400).json({ error: 'Usuario y contraseña requeridos.' }); return; }
  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM admin WHERE username = ?', [username]);
    if (!user) { res.status(401).json({ error: 'Credenciales inválidas.' }); return; }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { res.status(401).json({ error: 'Credenciales inválidas.' }); return; }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Certifications
app.get('/api/certifications', async (_req, res: Response) => {
  try {
    const db = await getDb();
    res.json(await db.all('SELECT * FROM certifications ORDER BY year DESC, id DESC'));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/certifications/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { link, title, icon, year } = req.body;
  try {
    const db = await getDb();
    const cert = await db.get('SELECT * FROM certifications WHERE id = ?', [id]);
    if (!cert) { res.status(404).json({ error: 'Certificación no encontrada.' }); return; }
    await db.run('UPDATE certifications SET title = ?, icon = ?, year = ?, link = ? WHERE id = ?',
      [title ?? cert.title, icon ?? cert.icon, year ?? cert.year, link ?? cert.link, id]);
    res.json({ message: 'Certificación actualizada.', id });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Testimonials
app.get('/api/testimonials', async (_req, res: Response) => {
  try {
    const db = await getDb();
    res.json(await db.all('SELECT * FROM testimonials WHERE verified = 1 ORDER BY id DESC'));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/testimonials', async (req: Request, res: Response) => {
  const { name, role, text, rating } = req.body;
  if (!name || !role || !text || rating === undefined) { res.status(400).json({ error: 'Faltan campos obligatorios.' }); return; }
  try {
    const db = await getDb();
    await db.run('INSERT INTO testimonials (name, role, text, rating, likes, verified) VALUES (?, ?, ?, ?, 0, 1)', [name, role, text, rating]);
    res.status(201).json({ message: '¡Testimonio registrado con éxito! Gracias.' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/testimonials/:id/like', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const t = await db.get('SELECT * FROM testimonials WHERE id = ?', [id]);
    if (!t) { res.status(404).json({ error: 'Testimonio no encontrado.' }); return; }
    await db.run('UPDATE testimonials SET likes = likes + 1 WHERE id = ?', [id]);
    res.json({ message: 'Like registrado.', id });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Contacts
app.post('/api/contacts', async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone || !message) { res.status(400).json({ error: 'Todos los campos son obligatorios.' }); return; }
  try {
    const db = await getDb();
    await db.run('INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)', [name, email, phone, message]);
    res.status(201).json({ message: 'Ticket de soporte registrado. Nos comunicaremos contigo pronto.' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/contacts', authMiddleware, async (_req, res: Response) => {
  try {
    const db = await getDb();
    res.json(await db.all('SELECT * FROM contacts ORDER BY created_at DESC'));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/contacts/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) { res.status(400).json({ error: 'Estado requerido.' }); return; }
  try {
    const db = await getDb();
    const c = await db.get('SELECT * FROM contacts WHERE id = ?', [id]);
    if (!c) { res.status(404).json({ error: 'Ticket no encontrado.' }); return; }
    await db.run('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Estado del ticket actualizado.', id, status });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Settings
app.get('/api/settings', async (_req, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM settings');
    const obj: Record<string, string> = {};
    rows.forEach(r => { obj[r.key] = r.value; });
    res.json(obj);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/settings/:key', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;
  if (value === undefined) { res.status(400).json({ error: 'Valor requerido.' }); return; }
  try {
    const db = await getDb();
    const s = await db.get('SELECT * FROM settings WHERE key = ?', [key]);
    if (!s) { res.status(404).json({ error: 'Configuración no encontrada.' }); return; }
    await db.run('UPDATE settings SET value = ? WHERE key = ?', [value, key]);
    res.json({ message: `Configuración ${key} actualizada.`, key, value });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default app;
