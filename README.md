# Campus Library

Aplicacion de biblioteca universitaria migrada a React con Vite.

## Funcionalidades

- Busqueda de libros usando Open Library.
- Filtros por idioma, ano y tema.
- Detalle de libro en modal.
- Favoritos, lista de lectura, reservas e historial con `localStorage`.
- Boton visible para volver al catalogo despues de buscar o filtrar.
- Tema claro/oscuro.

## Estructura

```text
biblioteca-profesional/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── components/
    ├── hooks/
    ├── services/
    └── utils/
```

## Ejecutar

```bash
npm install
npm run dev
```

Para generar version de produccion:

```bash
npm run build
```
