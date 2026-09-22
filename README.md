# Categorización Dental

Sitio web de Categorización Dental preparado para publicarse en Hostinger.

## Desarrollo local

```bash
npm install
npm run dev
```

## Publicación en Hostinger como aplicación Node.js

Configura el proyecto con estos valores:

- Rama: `main`
- Versión de Node.js: 22 (también admite 20.19 o superior)
- Comando de instalación: `npm install`
- Comando de compilación: `npm run build`
- Directorio de salida: `dist`
- Comando de inicio, si Hostinger lo solicita: `npm start`
- Archivo de entrada, si aparece como tipo “Other”: `server.mjs`

## Publicación estática mediante Advanced → Git

Selecciona la rama `hostinger-static`. Esa rama contiene la versión compilada con `index.html` en la raíz y no requiere ejecutar Node.js ni un comando de compilación.

## Contenido

- Recorrido visual animado por los ambientes del consultorio.
- Autodiagnóstico profesional con 10 preguntas desplegables.
- Recomendación automática según las respuestas.
- Planes, testimonios y contacto por WhatsApp.
