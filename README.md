
# Campus Library - estructura organizada

Proyecto reorganizado en una estructura más profesional, sin usar build tools.

## Estructura

```text
biblioteca-profesional/
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── core/
│       │   ├── state.js
│       │   ├── storage.js
│       │   └── theme.js
│       ├── services/
│       │   └── openLibrary.js
│       ├── ui/
│       │   ├── catalog.js
│       │   ├── modal.js
│       │   └── navigation.js
│       └── features/
│           ├── favorites.js
│           ├── history.js
│           ├── readingList.js
│           └── reservations.js
```

## Cómo abrir

Abre `index.html` en el navegador.

## Qué cambió

- Se eliminaron `onclick` inline del HTML.
- La lógica quedó separada por responsabilidad.
- Se mantuvo el mismo comportamiento funcional del proyecto original.
