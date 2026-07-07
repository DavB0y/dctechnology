import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from './db';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';

app.use(cors());
app.use(express.json());

// Middleware de Autenticación de Administrador
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
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

// ----------------------------------------------------
// RUTAS DE AUTENTICACIÓN
// ----------------------------------------------------
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    return;
  }

  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM admin WHERE username = ?', [username]);

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username });
  } catch (error: any) {
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
});

// ----------------------------------------------------
// RUTAS DE CERTIFICACIONES
// ----------------------------------------------------
app.get('/api/certifications', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const certs = await db.all('SELECT * FROM certifications ORDER BY year DESC, id DESC');
    res.json(certs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/certifications/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { link, title, icon, year } = req.body;

  try {
    const db = await getDb();
    const cert = await db.get('SELECT * FROM certifications WHERE id = ?', [id]);
    if (!cert) {
      res.status(404).json({ error: 'Certificación no encontrada.' });
      return;
    }

    const updatedTitle = title !== undefined ? title : cert.title;
    const updatedIcon = icon !== undefined ? icon : cert.icon;
    const updatedYear = year !== undefined ? year : cert.year;
    const updatedLink = link !== undefined ? link : cert.link;

    await db.run(
      'UPDATE certifications SET title = ?, icon = ?, year = ?, link = ? WHERE id = ?',
      [updatedTitle, updatedIcon, updatedYear, updatedLink, id]
    );

    res.json({ message: 'Certificación actualizada con éxito.', id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// RUTAS DE TESTIMONIOS
// ----------------------------------------------------
app.get('/api/testimonials', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const testimonials = await db.all('SELECT * FROM testimonials WHERE verified = 1 ORDER BY id DESC');
    res.json(testimonials);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/testimonials', async (req: Request, res: Response) => {
  const { name, role, text, rating } = req.body;
  if (!name || !role || !text || rating === undefined) {
    res.status(400).json({ error: 'Faltan campos obligatorios para el testimonio.' });
    return;
  }

  try {
    const db = await getDb();
    await db.run(
      'INSERT INTO testimonials (name, role, text, rating, likes, verified) VALUES (?, ?, ?, ?, 0, 1)',
      [name, role, text, rating]
    );
    res.status(201).json({ message: 'Testimonio registrado con éxito. ¡Gracias!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/testimonials/:id/like', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const testimonial = await db.get('SELECT * FROM testimonials WHERE id = ?', [id]);
    if (!testimonial) {
      res.status(404).json({ error: 'Testimonio no encontrado.' });
      return;
    }

    await db.run('UPDATE testimonials SET likes = likes + 1 WHERE id = ?', [id]);
    res.json({ message: 'Like registrado.', id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// RUTAS DE CONTACTOS (TICKETS DE SOPORTE)
// ----------------------------------------------------
app.post('/api/contacts', async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone || !message) {
    res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    return;
  }

  try {
    const db = await getDb();
    await db.run(
      'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone, message]
    );
    res.status(201).json({ message: 'Ticket de soporte registrado con éxito. Nos comunicaremos contigo pronto.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contacts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const contacts = await db.all('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/contacts/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'El estado es requerido.' });
    return;
  }

  try {
    const db = await getDb();
    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [id]);
    if (!contact) {
      res.status(404).json({ error: 'Ticket no encontrado.' });
      return;
    }

    await db.run('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Estado del ticket actualizado.', id, status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// RUTAS DE CONFIGURACIÓN (SETTINGS)
// ----------------------------------------------------
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM settings');
    const settingsObj: Record<string, string> = {};
    rows.forEach(r => {
      settingsObj[r.key] = r.value;
    });
    res.json(settingsObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings/:key', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    res.status(400).json({ error: 'El valor es requerido.' });
    return;
  }

  try {
    const db = await getDb();
    const setting = await db.get('SELECT * FROM settings WHERE key = ?', [key]);
    if (!setting) {
      res.status(404).json({ error: 'Configuración no encontrada.' });
      return;
    }

    await db.run('UPDATE settings SET value = ? WHERE key = ?', [value, key]);
    res.json({ message: `Configuración ${key} actualizada.`, key, value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
