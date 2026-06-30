<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Portafolio Profesional

Este repositorio contiene el código fuente de mi portafolio profesional, una aplicación web moderna que integra gráficos 3D y capacidades de IA.

## Ejecutar Localmente

**Prerrequisitos:** Node.js (versión LTS recomendada)

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar las variables de entorno:
   - Crea un archivo `.env.local` si no existe.
   - Agrega tu clave de API de Gemini:
     ```
     GEMINI_API_KEY=tu_api_key_aqui
     ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Herramientas Utilizadas

Este proyecto ha sido construido utilizando las siguientes tecnologías y herramientas, seleccionadas por su rendimiento y ecosistema robusto:

### Dependencias Principales

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **React** | ^19.2.3 | Biblioteca de JavaScript para construir interfaces de usuario interactivas y basadas en componentes. |
| **React DOM** | ^19.2.3 | Paquete para trabajar con el DOM en aplicaciones React. |
| **@react-three/fiber** | ^9.4.2 | Renderizador de React para Three.js, permite crear y controlar escenas 3D de manera declarativa. |
| **@react-three/drei** | ^10.7.7 | Colección de utilidades, controles y abstracciones listas para usar con @react-three/fiber. |
| **Framer Motion** | ^12.23.26 | Biblioteca de animaciones de producción para React, utilizada para transiciones fluidas. |
| **@google/genai** | ^1.34.0 | SDK oficial para integrar los modelos de IA generativa de Google (Gemini) en la aplicación. |

### Dependencias de Desarrollo

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **Vite** | ^6.2.0 | Entorno de desarrollo frontend de próxima generación, rápido y ligero. |
| **TypeScript** | ~5.8.2 | Superset tipado de JavaScript que mejora la calidad del código y la experiencia de desarrollo. |
| **@vitejs/plugin-react** | ^5.0.0 | Plugin oficial de Vite para soporte de React con Fast Refresh. |

## Licencia

Este proyecto se distribuye bajo la licencia MIT, lo que permite su uso, modificación y distribución bajo los términos especificados a continuación.

### MIT License

**Copyright (c) 2025 Davide Contreras Huerta**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
