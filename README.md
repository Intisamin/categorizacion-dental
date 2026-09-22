# Categorización Dental

Sitio web de Categorización Dental preparado para publicarse en Hostinger.

## Desarrollo local

```bash
npm install
npm run dev
```

## Publicación estática en Hostinger

El código fuente se mantiene en `main`. Cada cambio en esa rama ejecuta una
compilación automática y publica **el contenido interno de `dist`** en la rama
`hostinger-static`.

En Hostinger configura Advanced → Git así:

- Repositorio: `Intisamin/categorizacion-dental`
- Rama: `hostinger-static`
- Directorio de destino: `public_html`
- Comando de compilación: ninguno
- Comando de inicio: ninguno

La rama `hostinger-static` debe mostrar `index.html`, `assets/` y las imágenes
directamente en su raíz. No debe contener una carpeta `dist`.

Para comprobar la compilación manualmente:

```bash
npm ci
npm run build
```

El resultado se genera en `dist/index.html`. Node.js 22 se utiliza solamente
para compilar; la página publicada funciona como HTML, CSS y JavaScript estáticos.

## Contenido

- Recorrido visual animado por los ambientes del consultorio.
- Autodiagnóstico profesional con 10 preguntas desplegables.
- Recomendación automática según las respuestas.
- Planes, testimonios y contacto por WhatsApp.
