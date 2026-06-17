# Base de datos — Gestión de Coches y Marcas

Este documento describe el esquema de datos almacenado en **Supabase** (PostgreSQL). Es la referencia usada por `js/config.js` y los módulos `*API.js`.

---

## Diagrama de relaciones

```
┌─────────────────┐         ┌─────────────────┐
│     marcas      │         │     coches      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────│ marca_id (FK)   │
│ nombre          │   1:N   │ id (PK)         │
│ pais            │         │ modelo          │
└─────────────────┘         │ anio            │
                            │ precio          │
                            └─────────────────┘
```

- Una **marca** puede tener **muchos coches**.
- Un **coche** pertenece a **una sola marca**.
- Si intentas borrar una marca con coches, PostgreSQL bloquea la operación (`ON DELETE RESTRICT`).

---

## Tabla `marcas`

Almacena las marcas de vehículos (Toyota, Volkswagen, etc.).

| Columna  | Tipo PostgreSQL | Nullable | Descripción                    |
|----------|-----------------|----------|--------------------------------|
| `id`     | `serial`        | NO       | Clave primaria autoincremental |
| `nombre` | `varchar(50)`   | NO       | Nombre de la marca             |
| `pais`   | `varchar(50)`   | SÍ       | País de origen (opcional)      |

### SQL de creación

```sql
CREATE TABLE marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    pais VARCHAR(50)
);
```

### Ejemplos de datos

| id | nombre     | pais      |
|----|------------|-----------|
| 1  | Toyota     | Japón     |
| 2  | Volkswagen | Alemania  |
| 3  | Seat       | España    |

---

## Tabla `coches`

Almacena los vehículos asociados a una marca.

| Columna    | Tipo PostgreSQL  | Nullable | Descripción                         |
|------------|------------------|----------|-------------------------------------|
| `id`       | `serial`         | NO       | Clave primaria autoincremental      |
| `marca_id` | `integer`        | NO       | Referencia a `marcas.id`            |
| `modelo`   | `varchar(100)`   | NO       | Nombre del modelo                   |
| `anio`     | `integer`        | SÍ       | Año de fabricación                  |
| `precio`   | `numeric(10, 2)` | SÍ       | Precio en euros (2 decimales)       |

### SQL de creación

```sql
CREATE TABLE coches (
    id SERIAL PRIMARY KEY,
    marca_id INTEGER NOT NULL REFERENCES marcas(id) ON DELETE RESTRICT,
    modelo VARCHAR(100) NOT NULL,
    anio INTEGER,
    precio NUMERIC(10, 2)
);
```

### Ejemplos de datos

| id | marca_id | modelo  | anio | precio   |
|----|----------|---------|------|----------|
| 1  | 1        | Corolla | 2022 | 25000.00 |
| 2  | 2        | Golf    | 2021 | 22000.00 |
| 3  | 1        | Yaris   | 2023 | 18000.00 |

---

## Script completo de inicialización

Copia y ejecuta esto en el **SQL Editor** de Supabase:

```sql
-- Crear tablas
CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    pais VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS coches (
    id SERIAL PRIMARY KEY,
    marca_id INTEGER NOT NULL REFERENCES marcas(id) ON DELETE RESTRICT,
    modelo VARCHAR(100) NOT NULL,
    anio INTEGER,
    precio NUMERIC(10, 2)
);

-- Datos de ejemplo
INSERT INTO marcas (nombre, pais) VALUES
    ('Toyota', 'Japón'),
    ('Volkswagen', 'Alemania'),
    ('Seat', 'España');

INSERT INTO coches (marca_id, modelo, anio, precio) VALUES
    (1, 'Corolla', 2022, 25000.00),
    (2, 'Golf', 2021, 22000.00),
    (1, 'Yaris', 2023, 18000.00);
```

---

## Consultas usadas por la aplicación

### Listar marcas (ordenadas por nombre)

```
GET /rest/v1/marcas?select=*&order=nombre.asc
```

### Listar coches con nombre de marca (join)

```
GET /rest/v1/coches?select=*,marcas(nombre)&order=id.desc
```

Supabase devuelve un objeto anidado `marcas` con el nombre. El código lo transforma a `nombre_marca` para mostrarlo en la tabla.

### Crear registro

```
POST /rest/v1/marcas
POST /rest/v1/coches
```

Con header `Prefer: return=representation` para recibir el registro creado.

### Actualizar registro

```
PATCH /rest/v1/marcas?id=eq.{id}
PATCH /rest/v1/coches?id=eq.{id}
```

### Eliminar registro

```
DELETE /rest/v1/marcas?id=eq.{id}
DELETE /rest/v1/coches?id=eq.{id}
```

---

## Row Level Security (RLS)

Por defecto Supabase activa RLS. Para un proyecto educativo puedes:

**Opción A — Desactivar RLS (solo desarrollo):**

```sql
ALTER TABLE marcas DISABLE ROW LEVEL SECURITY;
ALTER TABLE coches DISABLE ROW LEVEL SECURITY;
```

**Opción B — Políticas públicas (recomendado para aprendizaje):**

```sql
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE coches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso público marcas" ON marcas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público coches" ON coches
    FOR ALL USING (true) WITH CHECK (true);
```

> En producción real, las políticas deben restringir el acceso por usuario autenticado.

---

## Errores frecuentes

| Error | Causa probable | Solución |
|-------|----------------|----------|
| `violates foreign key constraint` | `marca_id` no existe | Crear la marca antes del coche |
| `update or delete on table "marcas" violates foreign key` | Marca con coches asociados | Eliminar primero los coches |
| `401 Unauthorized` | API key incorrecta | Revisar `js/config.js` |
| `relation "marcas" does not exist` | Tablas no creadas | Ejecutar el SQL de inicialización |

---

## Referencias

- [Supabase: Database](https://supabase.com/docs/guides/database)
- [PostgREST API](https://postgrest.org/en/stable/references/api.html)
- Especificación general: [`../spec.md`](../spec.md)
