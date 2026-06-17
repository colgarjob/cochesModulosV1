# Especificación funcional — Módulo Marcas

Define **qué debe hacer** la pantalla de gestión de marcas desde el punto de vista del usuario.

---

## Objetivo

Permitir al usuario **crear, ver, editar y eliminar** marcas de vehículos (Toyota, Seat, BMW, etc.).

---

## Pantalla: `marcas.html`

### Secciones

1. **Cabecera** — Título, enlaces a Inicio y Gestión de Coches
2. **Formulario** — Alta y edición de marcas
3. **Tabla** — Listado de todas las marcas registradas

---

## Campos del formulario

| Campo    | Tipo   | Obligatorio | Validación                          |
|----------|--------|-------------|-------------------------------------|
| Nombre   | texto  | Sí          | No vacío, máximo 50 caracteres      |
| País     | texto  | No          | Máximo 50 caracteres                |

---

## Comportamientos esperados

### Al cargar la página

- Mostrar "Cargando marcas..." en la tabla
- Obtener marcas de Supabase ordenadas por nombre (A→Z)
- Si no hay marcas: mensaje "No hay marcas registradas"
- Si hay error de red/API: mensaje de error visible

### Crear marca

1. Usuario escribe nombre (y opcionalmente país)
2. Pulsa **Guardar**
3. Si el nombre está vacío → error "El nombre de la marca es obligatorio"
4. Si todo OK → marca creada, formulario reseteado, tabla actualizada

### Editar marca

1. Usuario pulsa **Editar** en una fila
2. El formulario se rellena con los datos actuales
3. El título cambia a "✏️ Editar Marca"
4. La página hace scroll suave hasta el formulario
5. Usuario modifica y pulsa **Guardar**
6. Marca actualizada, formulario vuelve a modo "Nueva Marca"

### Cancelar edición

1. Usuario pulsa **Cancelar**
2. Formulario se limpia
3. Título vuelve a "➕ Nueva Marca"
4. Modo edición cancelado

### Eliminar marca

1. Usuario pulsa **Eliminar**
2. Aparece confirmación: "¿Estás seguro de eliminar esta marca?"
3. Si cancela → no pasa nada
4. Si confirma y la marca **no tiene coches** → se elimina y la tabla se actualiza
5. Si la marca **tiene coches asociados** → error explicando que no se puede eliminar
6. Si estaba editando esa marca, el formulario se resetea

---

## Tabla de marcas

| Columna  | Contenido                    |
|----------|------------------------------|
| ID       | Identificador numérico       |
| Nombre   | Nombre de la marca           |
| País     | País o "-" si está vacío     |
| Acciones | Botones Editar y Eliminar    |

---

## Mensajes al usuario

| Situación                    | Mensaje                                              |
|------------------------------|------------------------------------------------------|
| Nombre vacío                 | El nombre de la marca es obligatorio                 |
| Error al cargar              | Error al cargar las marcas                           |
| Error al eliminar con coches | Error al eliminar la marca. Verifica que no tenga coches asociados. |
| Formulario no encontrado     | Error: no se encontró el formulario en la página... |

---

## Relación con otros módulos

- Las marcas creadas aquí aparecen en el **selector de marcas** de `coches.html`
- Se recomienda crear marcas **antes** de crear coches

---

## Referencias

- Implementación: [`marcasImplementation.md`](marcasImplementation.md)
- Base de datos: [`../../database.md`](../../database.md)
- Arquitectura: [`../../architecture.md`](../../architecture.md)
