import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import { getDb } from './db';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';

// Inicializar cliente de Google GenAI
const geminiApiKey = process.env.GEMINI_API_KEY;
const aiClient = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

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

// ----------------------------------------------------
// RUTA DE CHATBOT IA CON GEMINI (PROXY SEGURO)
// ----------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message) {
    res.status(400).json({ error: 'El mensaje es requerido.' });
    return;
  }

  if (!aiClient) {
    res.status(500).json({ 
      error: 'El servicio de IA no está configurado en el servidor. Falta configurar GEMINI_API_KEY.' 
    });
    return;
  }

  try {
    const systemInstruction = 
      "Eres el asistente virtual inteligente de Davide Contreras, especialista en Soporte Técnico de computadoras y redes con certificación Cisco. " +
      "Tu objetivo es ayudar a los usuarios que visitan su portafolio web a diagnosticar de forma preliminar problemas técnicos cotidianos. " +
      "Responde en español de forma atenta, amable y profesional. " +
      "Puedes orientar sobre temas de: " +
      "- Computadoras lentas, limpieza física por polvo y mantenimiento térmico con pasta térmica. " +
      "- Respaldos y copias de seguridad de datos en la nube y discos duros. " +
      "- Problemas de red, Wi-Fi inestable y routers Cisco o genéricos. " +
      "- Selección de componentes de hardware como CPU, RAM y discos SSD, además de asesoramiento de compra. " +
      "- Instalación de sistemas operativos y programas comunes. " +
      "IMPORTANTE: Si el problema es de alta complejidad, como micro-soldadura, reparación física de placa, fallas graves de hardware o requiere soporte presencial urgente, debes recomendar contactar directamente a Davide. " +
      "También debes facilitar sus datos si el usuario pide contactarse, solicita precios, número, WhatsApp, correo o atención directa. " +
      "En esos casos responde de forma breve, amable y profesional con este mensaje: " +
      "Claro, puedes comunicarte directamente con Davide a través de los siguientes medios: " +
      "WhatsApp/Teléfono: +51926533855. " +
      "Correo electrónico: davidecontrerashuerta10@gmail.com. " +
      "También puedes revisar la sección de Contacto del sitio web para más información. " +
      "Si tienes alguna consulta previa, también puedo orientarte por aquí.";

    const formattedContents: any[] = [];

    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        formattedContents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      });
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    let response;
    try {
      response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedContents,
        config: { systemInstruction }
      });
    } catch (primaryErr) {
      console.warn("Gemini 2.5-flash falló, intentando con gemini-1.5-flash...", primaryErr);
      response = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: formattedContents,
        config: { systemInstruction }
      });
    }

    const responseText = response.text || "Lo siento, no pude procesar tu mensaje en este momento.";
    res.json({ text: responseText });
  } catch (error: any) {
    console.error('Error llamando a Gemini:', error);
    res.status(500).json({ error: 'Error al comunicarse con el asistente de IA: ' + error.message });
  }
});

export default app;
