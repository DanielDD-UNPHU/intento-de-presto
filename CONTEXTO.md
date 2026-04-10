# IntentoDePresto — Contexto del proyecto

Editor de presupuestos de obra estilo Presto, integrado con el catálogo BC3 (FIEBDC-3) de ConstruCosto.do.

## Stack
- **React 18 + TypeScript + Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Lucide React** para iconos
- **uuid** para IDs
- Sin librerías de grid externas (todo custom)
- Repo: https://github.com/DanielDD-UNPHU/intento-de-presto

## Estructura del proyecto

```
src/
├── components/
│   ├── PresupuestoEditor.tsx      ← Componente principal (layout, modales, wiring)
│   ├── PresupuestoGrid.tsx        ← Grilla con drag & drop, edit inline, override
│   ├── BC3Panel.tsx               ← Sidebar dark del catálogo BC3 (4 niveles)
│   ├── FloatingToolbar.tsx        ← Toolbar flotante al seleccionar filas
│   ├── PropagationDialog.tsx      ← Modal para propagación de componentes
│   ├── AddBloqueNivelModal.tsx    ← Modal para crear bloques/niveles
│   └── TipoBadge.tsx              ← Badge de tipo (CAP, PAR, MAT, M.O, MAQ, SUB)
├── hooks/
│   └── usePresupuesto.ts          ← Hook con TODA la lógica del estado
├── data/
│   ├── mockBC3.ts                 ← Catálogo BC3 mock (4 niveles, datos reales)
│   ├── mockPresupuesto.ts         ← Presupuesto inicial (Niveles > Bloques > Capítulos)
│   └── mockBloques.ts             ← (deprecated, usar mockPresupuesto)
├── utils/
│   ├── bc3Parser.ts               ← Parser FIEBDC-3 (.bc3) → BC3Data
│   ├── componentUtils.ts          ← deepCloneSubtree para componentes
│   ├── formatters.ts              ← formatMoney, parsePastedRows
│   └── tipoConfig.ts              ← Config de colores y labels por tipo
└── types.ts                       ← Todos los tipos (ConceptoPresupuesto, BC3*, etc.)
```

## Estructura jerárquica del presupuesto

**4 niveles + items:**
```
NIVEL 1 (raíz, sin parent)        ← rootIds[]
  └─ BLOQUE A (parent: NIVEL 1)
      └─ A04# HORMIGON (categoría BC3 nivel 1)
          └─ A0402# COLUMNAS CUADRADAS (categoría BC3 nivel 2)
              └─ A040237 Columna 30x30... (item, partida)
```

**Reglas:**
- **Nivel jerárquico 0 (raíz):** Niveles del proyecto (NIVEL 1, PLANTA BAJA, SOTANO, AZOTEA)
- **Bloques:** hijos directos de un Nivel (BLOQUE A, BLOQUE B, AREAS COMUNES)
- **Categorías BC3:** códigos que terminan en `#` (A04#, A0402#)
- **Items:** códigos sin `#` (A040237, A150100, etc.)

## Estructura del catálogo BC3 (sidebar)

4 niveles que matchean el archivo .bc3 real:
```
A#  PARTIDAS EDIFICACIONES               ← BC3Categoria
  A04#  HORMIGON                          ← BC3SubCategoria
    A0402#  HORMIGON ARMADO EN COLUMNAS  ← BC3SubSubCategoria
      A040237  Columna 30x30...           ← BC3Item
```

Categorías top:
- `A#` PARTIDAS EDIFICACIONES (25 sub-categorías)
- `C#` PARTIDAS CARRETERAS Y MOV. TIERRAS
- `E#` EQUIPOS Y MAQUINARIAS
- `H#` MANO DE OBRA Y JORNALES
- `M#` MATERIALES E INSUMOS
- `S#` SUBCONTRATOS

## Features implementadas

### 1. Edición inline tipo spreadsheet
- Click en celda para editar (excepto código que es auto-generado)
- Tab navega entre campos, Enter pasa a la siguiente fila
- Códigos auto-generados por posición en el árbol (`1.2.3.4`)
- **Columna Unidad** es dropdown con 22 unidades de construcción RD

### 2. Tree expandible in-place
- Doble click en Capítulo → toggle expand/collapse
- Indentación visual por nivel
- Hover sigue color del nivel (azul/verde/ámbar)

### 3. Selección de filas
- Click en `#` selecciona la fila
- **Drag para seleccionar rango** (bidireccional: seleccionar y deseleccionar)
- Shift+click para rango, Ctrl/Cmd+click para múltiple
- Click en fila ya seleccionada la deselecciona
- Tab fuera de input deselecciona todo

### 4. Sistema de override de precios
- Editar precio → guarda original en `overrides`, marca celda en **rojo + fondo rosado + borde izquierdo**
- Botón revert (Undo2) aparece solo en hover de celda overrideada
- Click revert → restaura valor original
- Funciona en `precioInterno`, `precioCliente`, `cantidad`, `descripcion`, `unidad`

### 5. Drag & Drop desde BC3 (catálogo)
- Items del sidebar son draggables
- **Smart bounding box**: rodea todo el BLOQUE o NIVEL donde va a caer
- Auto-creación de carpetas: crea `A04# HORMIGON > A0402# COLUMNAS` automáticamente
- Si el folder ya existe, lo reusa (no duplica)
- Drop sobre Nivel → item cae como hermano de bloques
- Drop sobre Bloque → item cae dentro del bloque
- Drop sobre cualquier hijo de bloque → sube al bloque

### 6. Drag & Drop interno (mover filas del grid)
- Solo items (no Capítulos) son draggables
- Restricciones por categoría BC3: un item de A04# nunca puede caer en A07#
- `canRowDropOn`: verifica que el target sea Nivel, Bloque, o misma categoría BC3
- `ensureBC3Chain`: matchea por código, no por nombre — sin folders duplicados
- Drop preciso: línea azul arriba (before), abajo (after), o inside

### 7. Sistema de componentes
- **Copiar como Componente**: clon ligado, cambios se propagan
- **Copia independiente**: deep clone sin link
- **Override en instancias**: marcar campos como modificados
- **Dialog de propagación**: aplicar a todas / solo sin override / no propagar
- Indicadores visuales: stripe violeta (source), cyan (instancia)

### 8. Bloques y Niveles
- Modal "Bloques y Niveles" para crear estructura del proyecto
- Crear nuevo Bloque → se agrega como hijo de un Nivel
- Crear nuevo Nivel → se agrega a la raíz
- En BIMCORD real, los bloques vienen del módulo de factibilidad (mock data por ahora)

### 9. Items custom en BC3 (por empresa)
- Botón `+` en cada sub-subcategoría del sidebar para crear items propios
- Modal con dropdown de unidades + código auto-generado siguiendo secuencia
- Items custom marcados con badge "PROPIO" verde
- Botón eliminar (solo para items custom)
- Items del catálogo base son inmutables

### 10. Upload de archivo .bc3
- Botón Upload en el header del BC3 sidebar
- Lee como Latin-1 (encoding del FIEBDC-3)
- Parser construye el árbol de 4 niveles
- Footer muestra nombre del archivo cargado
- Botón "Quitar" vuelve al mock

### 11. Columna de acciones (al final de la grilla)
- Botón **FolderPlus** (crear carpeta):
  - Aparece en Niveles, Bloques, y carpetas no-BC3
  - NO aparece en categorías BC3 (códigos con `#`) ni en items
- Botón **Trash** (eliminar):
  - Aparece solo en filas raíz (Niveles)
  - Abre confirm modal "¿Estás seguro?"

### 12. Toolbar flotante (al seleccionar filas)
- Subir/bajar (Alt+↑/↓)
- Aumentar/disminuir nivel (Alt+←/→)
- Cambiar tipo (Capitulo, Partida, Material, etc.)
- Copiar como componente / independiente
- Crear carpeta (solo si selección es no-BC3)
- Eliminar

### 13. Pegar desde Excel
- Ctrl+V con datos copiados de Excel parsea filas tab-separated
- Formato esperado: `Codigo | Descripción | Unidad | Cantidad | Precio`

### 14. Total general en footer
- Costo Interno (ámbar) + Cliente (azul) + Margen %

## Decisiones técnicas importantes

### Modelo de datos
- **Flat map** `Record<string, ConceptoPresupuesto>` para O(1) lookup
- **rootIds** separado como `string[]`
- **parentId** + **childrenIds** para la jerarquía
- `nivel` se calcula recursivamente (no se almacena)

### Override tracking
- Guarda el **valor original** en `overrides`, no el override
- El valor actual del concepto SIEMPRE es la fuente de verdad
- Para revert: copia original a campo y borra del overrides

### Categorías BC3 vs carpetas custom
- BC3: código termina en `#` (A04#, A0402#)
- Custom: código sin `#` (BLOQUE A, NIVEL 1, "Mi carpeta")
- Esta distinción es clave para las restricciones de drag & drop

### Refs para state stale
- `conceptosRef` y `rootIdsRef` para leer valores frescos en handlers de drop
- Evita closures stale cuando hay múltiples drops rápidos

## Estado de la mock data

Estructura actual: **6 Niveles**:
- SOTANO 1 (BLOQUE A, BLOQUE B)
- PLANTA BAJA (BLOQUE A, BLOQUE B, AREAS COMUNES)
- NIVEL 1 (BLOQUE A, BLOQUE B) — el más completo
- NIVEL 2 (BLOQUE A)
- NIVEL 3 (BLOQUE A)
- AZOTEA (BLOQUE A)

Cada bloque tiene categorías reales del BC3 (A03 Mov. Tierras, A04 Hormigon, A06 Mamposteria, A07 Terminaciones, A09 Pisos, A11 Techos, A15 Sanitarias, A17 Eléctricas, A19 Pinturas, A21 Parqueos) con items y precios **exactos** del archivo `ConstruCosto.do-PRESTO-Santo-Domingo-MARZO-2026.bc3`.

## Pendientes / Próximos pasos

- Conectar con backend Django de BIMCORD (endpoints listos)
- Importar bloques desde el módulo de factibilidad (Vinkor)
- Persistir custom items por empresa (multi-tenant)
- Exportar a PDF/Excel
- Undo/Redo
- Validación de duplicados al crear carpetas (no puede haber dos carpetas con el mismo nombre en el mismo padre)
