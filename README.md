# Che Planeta

Aplicación web de Che Planeta preparada para desplegar en Vercel.

## Publicar en Vercel

1. Subí el contenido de esta carpeta a un repositorio de GitHub.
2. En Vercel, importá ese repositorio y mantené los valores detectados (Build: `npm run build`; Output: `dist`).
3. En Project Settings → Environment Variables, agregá `GEMINI_API_KEY` con tu clave de Gemini. No publiques esa clave en GitHub ni la pongas en archivos del proyecto.
4. Volvé a desplegar el proyecto.

Sin `GEMINI_API_KEY`, la aplicación puede mostrar el análisis de demostración incluido, pero no hará análisis reales con Gemini.

## Ejecutar localmente

Requiere Node.js. Ejecutá `npm install` y luego `npm run dev`.

## Nota

El catálogo de puntos verdes incluido en el proyecto contiene ubicaciones de demostración en Buenos Aires; verificá y actualizá esos datos antes de presentarlos como puntos cercanos al usuario.
