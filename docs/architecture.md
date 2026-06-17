# Arquitectura — Gestión de Coches y Marcas

Este documento explica **cómo está organizado el código** y **cómo fluyen los datos** entre la interfaz, JavaScript y Supabase.

---

## Visión general

La aplicación sigue una arquitectura **frontend modular sin framework**:

```
Usuario (navegador)
       │
       ▼
┌──────────────────┐
│   HTML + CSS     │  Páginas estáticas (index, marcas, coches)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Capa UI        │  *UI.js — eventos, DOM, validaciones
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Capa API       │  *API.js — fetch hacia Supabase
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Supabase       │  PostgreSQL + REST API (PostgREST)
└──────────────────┘
```

No hay servidor propio: el navegador habla directamente con la API REST de Supabase usando `fetch`.

---

## Estructura de carpetas

```
cochesModulosV1/
├── index.html                    # Menú principal (sin JS)
├── marcas.html                   # Página del módulo Marcas
├── coches.html                   # Página del módulo Coches
├── css/
│   └── styles.css                # Estilos globales compartidos
├── js/
│   ├── config.js                 # Configuración centralizada
│   ├── modules/
│   │   ├── marcas/
│   │   │   ├── marcasAPI.js      # Peticiones HTTP de marcas
│   │   │   └── marcasUI.js       # Interfaz de marcas
│   │   └── coches/
│   │       ├── cochesAPI.js      # Peticiones HTTP de coches
│   │       └── cochesUI.js       # Interfaz de coches
│   └── utils/
│       ├── errorHandler.js       # Mostrar/ocultar errores
│       └── formHelper.js         # Utilidades de formularios
└── docs/                         # Documentación del proyecto
```

---

## Separación de responsabilidades

### Regla principal

Cada entidad (Marcas, Coches) se divide en **dos archivos**:

| Archivo    | Responsabilidad                                      | No debe hacer |
|------------|------------------------------------------------------|---------------|
| `*API.js`  | Llamadas `fetch`, URLs, headers, parseo JSON         | Manipular el DOM |
| `*UI.js`   | Formularios, tablas, eventos, validaciones visuales  | Construir URLs de Supabase |

### Utilidades compartidas

| Archivo            | Uso                                              |
|--------------------|--------------------------------------------------|
| `config.js`        | URL, API key, headers, nombres de tablas         |
| `errorHandler.js`  | Mostrar errores al usuario de forma uniforme     |
| `formHelper.js`    | Leer, rellenar y resetear formularios            |

---

## Módulos ES6 (import / export)

JavaScript moderno permite dividir el código en archivos que se importan entre sí.

**Ejemplo simplificado:**

```javascript
// config.js — exporta constantes
export { API_BASE, SUPABASE_HEADERS, TABLES };

// marcasAPI.js — importa config y exporta funciones
import { API_BASE, SUPABASE_HEADERS, TABLES } from '../../config.js';
export async function fetchMarcas() { /* ... */ }

// marcasUI.js — importa API y utilidades
import { fetchMarcas } from './marcasAPI.js';
import { showError } from '../../utils/errorHandler.js';
```

En el HTML se carga con:

```html
<script type="module" src="js/modules/marcas/marcasUI.js"></script>
```

> **Importante:** Los módulos ES6 requieren servir la app por HTTP (`npx serve .`), no abrir el HTML con `file://`.

---

## Flujo de datos — Crear una marca

```
1. Usuario rellena formulario y pulsa "Guardar"
         │
         ▼
2. marcasUI.js → saveMarca()
   - event.preventDefault() evita recargar la página
   - getFormData() lee los campos
   - Valida que nombre no esté vacío
         │
         ▼
3. marcasUI.js → createMarca(marcaData)
         │
         ▼
4. marcasAPI.js → fetch POST a Supabase
   - URL: /rest/v1/marcas
   - Body: JSON con { nombre, pais }
         │
         ▼
5. Supabase inserta en PostgreSQL y devuelve el registro
         │
         ▼
6. marcasUI.js → resetFormHandler() + loadMarcas()
   - Limpia formulario
   - Recarga la tabla con fetchMarcas()
```

---

## Flujo de datos — Listar coches con marca

```
1. cochesUI.js → loadCoches() al cargar la página
         │
         ▼
2. cochesAPI.js → fetchCoches()
   - GET /coches?select=*,marcas(nombre)
         │
         ▼
3. Supabase hace JOIN y devuelve:
   { id: 1, modelo: "Corolla", marcas: { nombre: "Toyota" }, ... }
         │
         ▼
4. cochesAPI.js mapea a:
   { ..., nombre_marca: "Toyota" }
         │
         ▼
5. cochesUI.js genera filas HTML de la tabla
   - escapeHtml() protege contra XSS
```

---

## Páginas HTML

| Página       | Script cargado              | Propósito                    |
|--------------|-----------------------------|------------------------------|
| `index.html` | Ninguno                     | Navegación entre módulos     |
| `marcas.html`| `marcasUI.js`               | CRUD de marcas               |
| `coches.html`| `cochesUI.js`               | CRUD de coches               |

Cada página de CRUD incluye:

- `#errorContainer` — mensajes de error
- Formulario con campos y botones Guardar/Cancelar
- Tabla con tbody dinámico (`#marcasTableBody` / `#cochesTableBody`)

---

## Patrón CRUD en UI

Todas las páneas de gestión siguen el mismo patrón:

```
┌─────────────────────────────────────┐
│  Modo CREAR (editingId = null)      │
│  - Título: "➕ Nuevo ..."            │
│  - Submit → createX()               │
└─────────────────────────────────────┘
              │
              │ Click "Editar"
              ▼
┌─────────────────────────────────────┐
│  Modo EDITAR (editingId = id)       │
│  - Título: "✏️ Editar ..."           │
│  - fillForm() rellena campos        │
│  - Submit → updateX(id, data)       │
└─────────────────────────────────────┘
              │
              │ Click "Cancelar"
              ▼
        Vuelve a modo CREAR
```

---

## Manejo de errores

Centralizado en `errorHandler.js`:

1. La capa API lanza `Error` si `response.ok` es `false`
2. La capa UI captura con `try/catch`
3. Llama a `showError(containerId, mensaje, error)`
4. El mensaje aparece 5 segundos y desaparece solo

```javascript
try {
    await createMarca(data);
} catch (error) {
    showError('errorContainer', 'Error al guardar', error);
}
```

---

## Dependencias entre módulos

```
cochesUI.js
    ├── cochesAPI.js ──► config.js
    ├── marcasAPI.js ──► config.js   (para cargar el select de marcas)
    ├── errorHandler.js
    └── formHelper.js

marcasUI.js
    ├── marcasAPI.js ──► config.js
    ├── errorHandler.js
    └── formHelper.js
```

El módulo **Coches** depende del módulo **Marcas** solo para poblar el `<select>` de marcas. No hay acoplamiento inverso.

---

## Seguridad básica

| Medida              | Dónde se aplica                          |
|---------------------|------------------------------------------|
| Escape HTML         | `escapeHtml()` en *UI.js al renderizar   |
| Solo clave `anon`   | `config.js` (nunca `service_role`)       |
| Validación cliente  | *UI.js antes de enviar a la API          |
| FK RESTRICT         | Base de datos impide borrar marcas usadas|

---

## Documentación por módulo

| Módulo  | Especificación funcional              | Implementación técnica                    |
|---------|---------------------------------------|-------------------------------------------|
| Marcas  | [marcasSpec.md](modules/marcas/marcasSpec.md) | [marcasImplementation.md](modules/marcas/marcasImplementation.md) |
| Coches  | [cochesSpec.md](modules/coches/cochesSpec.md) | [cochesImplementation.md](modules/coches/cochesImplementation.md) |

---

## Referencias

- Base de datos: [`database.md`](database.md)
- Especificación completa: [`../spec.md`](../spec.md)
- [MDN: JavaScript Modules](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
