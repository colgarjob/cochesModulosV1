# Gestión de Coches y Marcas

Aplicación web de ejemplo para aprender **JavaScript moderno con módulos ES6**, **fetch** y **Supabase** como backend. Permite gestionar marcas de vehículos y los coches asociados a cada marca mediante operaciones CRUD (crear, leer, actualizar y eliminar).

## Objetivo del proyecto

Este repositorio demuestra cómo organizar una aplicación frontend **sin frameworks** (solo HTML, CSS y JavaScript), separando responsabilidades en módulos reutilizables:

- **API** (`*API.js`): comunicación con Supabase mediante `fetch`
- **UI** (`*UI.js`): manipulación del DOM, formularios y eventos
- **Utilidades** (`js/utils/`): funciones compartidas (errores, formularios)
- **Configuración** (`js/config.js`): credenciales y URLs centralizadas

Ideal para practicar conceptos como `import`/`export`, `async`/`await`, promesas y arquitectura modular.

## Requisitos previos

- Navegador moderno (Chrome, Firefox, Edge)
- Cuenta gratuita en [Supabase](https://supabase.com)
- Servidor local para cargar módulos ES6 (Live Server, `npx serve`, etc.)

## Configuración rápida

### 1. Crear las tablas en Supabase

Ejecuta el SQL descrito en la sección **Base de datos** de [`spec.md`](spec.md) en el SQL Editor de tu proyecto Supabase.

### 2. Configurar credenciales

Edita `js/config.js` y sustituye:

```javascript
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU-ANON-KEY';
```

Obtén estos valores en: **Supabase Dashboard → Project Settings → API**.

### 3. Ejecutar la aplicación

Abre el proyecto con un servidor local (no uses `file://` directamente, los módulos ES6 requieren HTTP):

```bash
npx serve .
```

Luego visita `http://localhost:3000` (o el puerto que indique el servidor).

## Estructura del proyecto

```
cochesModulosV1/
├── index.html              # Página de inicio con navegación
├── marcas.html             # CRUD de marcas
├── coches.html             # CRUD de coches
├── css/
│   └── styles.css          # Estilos globales
├── js/
│   ├── config.js           # Configuración de Supabase
│   ├── modules/
│   │   ├── marcas/
│   │   │   ├── marcasAPI.js
│   │   │   └── marcasUI.js
│   │   └── coches/
│   │       ├── cochesAPI.js
│   │       └── cochesUI.js
│   └── utils/
│       ├── errorHandler.js
│       └── formHelper.js
├── README.md               # Este archivo
└── spec.md                 # Especificación técnica del proyecto
```

## Funcionalidades

| Módulo  | Operaciones                                      |
|---------|--------------------------------------------------|
| Marcas  | Listar, crear, editar y eliminar marcas          |
| Coches  | Listar, crear, editar y eliminar coches          |

### Reglas de negocio

- Un coche **debe** estar asociado a una marca existente.
- El **nombre** de la marca y el **modelo** del coche son obligatorios.
- No se puede eliminar una marca si tiene coches asociados (restricción de clave foránea en la base de datos).

## Flujo de uso recomendado

1. Abre **Gestión de Marcas** y crea al menos una marca (ej: Toyota, España).
2. Abre **Gestión de Coches** y crea coches seleccionando la marca en el desplegable.
3. Usa los botones **Editar** y **Eliminar** de cada fila de la tabla.

## Tecnologías utilizadas

- HTML5 semántico
- CSS3 (diseño responsive básico)
- JavaScript ES Modules (`type="module"`)
- [Supabase REST API](https://supabase.com/docs/guides/api) (PostgREST)
- `fetch` nativo del navegador

## Documentación adicional

La especificación completa del proyecto (prompt técnico, arquitectura, esquema de BD y reglas de implementación) está en [`spec.md`](spec.md).

## Licencia

Proyecto educativo de ejemplo. Uso libre para aprendizaje.
