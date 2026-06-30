// Punto de entrada para desarrollo local - llama a app.listen
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { getDb } from './db';

const PORT = process.env.PORT || 5000;

getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('No se pudo inicializar la base de datos:', err);
});
