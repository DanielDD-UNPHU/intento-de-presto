import { useState, useRef, useCallback, useEffect } from 'react';
import type { ConceptoPresupuesto, OverridableField, BC3DragPayload } from '../types';
import { TipoBadge } from './TipoBadge';
import { formatMoney } from '../utils/formatters';
import { ChevronRight, ChevronDown, ClipboardPaste, Undo2, Link2, FolderPlus, Trash2 } from 'lucide-react';

interface Props {
  visibleIds: string[];
  rootIds: string[];
  conceptos: Record<string, ConceptoPresupuesto>;
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  onSelect: (ids: Set<string>) => void;
  onToggleExpand: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ConceptoPresupuesto>) => void;
  onRevertOverride: (id: string, field: OverridableField) => void;
  onDropBC3: (payload: BC3DragPayload, targetId: string | null, cantidad: number) => void;
  onMoveRow: (dragId: string, targetId: string | null, position: 'inside' | 'before' | 'after') => void;
  dropTargetId: string | null;
  onSetDropTarget: (id: string | null) => void;
  dropPosition: 'before' | 'after' | 'inside' | null;
  onSetDropPosition: (pos: 'before' | 'after' | 'inside' | null) => void;
  bc3DragPayload: BC3DragPayload | null;
  onSetBC3DragPayload: (p: BC3DragPayload | null) => void;
  getTotal: (id: string) => number;
  getTotalInterno: (id: string) => number;
  onCreateFolder: (parentId: string) => void;
  onDeleteConcepto: (id: string) => void;
}

type EditableField = 'codigo' | 'descripcion' | 'unidad' | 'cantidad' | 'precioRef' | 'precioInterno' | 'precioCliente';

const NUMERIC_FIELDS: EditableField[] = ['cantidad', 'precioRef', 'precioInterno', 'precioCliente'];
const COL_TEMPLATE = '42px 36px 84px 1fr 48px 120px 120px 120px 120px 140px 70px';

// Generate display code based on position in tree (e.g. "1.2.3")
function buildAutoCode(id: string, conceptos: Record<string, ConceptoPresupuesto>, rootIds: string[]): string {
  const c = conceptos[id];
  if (!c) return '';

  const indices: number[] = [];
  let current: ConceptoPresupuesto | undefined = c;
  while (current) {
    const siblings = current.parentId
      ? conceptos[current.parentId]?.childrenIds ?? []
      : rootIds;
    indices.unshift(siblings.indexOf(current.id) + 1);
    current = current.parentId ? conceptos[current.parentId] : undefined;
  }

  return indices.join('.');
}

export function PresupuestoGrid({
  visibleIds, rootIds, conceptos, selectedIds, expandedIds, onSelect, onToggleExpand, onUpdate,
  onRevertOverride, onDropBC3, onMoveRow, dropTargetId, onSetDropTarget,
  dropPosition, onSetDropPosition, bc3DragPayload, onSetBC3DragPayload,
  getTotal, getTotalInterno, onCreateFolder, onDeleteConcepto,
}: Props) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: EditableField } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const startEdit = useCallback((id: string, field: EditableField) => {
    const c = conceptos[id];
    if (!c) return;
    if (field === 'codigo') return; // Código se genera automáticamente
    if (c.tipo === 'Capitulo' && NUMERIC_FIELDS.includes(field)) return;
    const value = c[field];
    setEditingCell({ id, field });
    setEditValue(typeof value === 'number' ? (value || '').toString() : (value ?? ''));
  }, [conceptos]);

  const commitEdit = useCallback(() => {
    if (!editingCell) return;
    const { id, field } = editingCell;
    let parsedValue: string | number = editValue;
    if (NUMERIC_FIELDS.includes(field)) {
      parsedValue = parseFloat(editValue.replace(/,/g, '')) || 0;
    }
    onUpdate(id, { [field]: parsedValue });
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, onUpdate]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Selection
  const handleRowMouseDown = useCallback((idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (e.shiftKey && selectedIds.size > 0) {
      const allSelectedIndices = visibleIds.map((id, i) => selectedIds.has(id) ? i : -1).filter(i => i >= 0);
      const minSel = Math.min(...allSelectedIndices);
      const start = Math.min(minSel, idx);
      const end = Math.max(Math.max(...allSelectedIndices), idx);
      const newSet = new Set<string>();
      for (let i = start; i <= end; i++) newSet.add(visibleIds[i]);
      onSelect(newSet);
    } else if (e.metaKey || e.ctrlKey) {
      const newSet = new Set(selectedIds);
      newSet.has(visibleIds[idx]) ? newSet.delete(visibleIds[idx]) : newSet.add(visibleIds[idx]);
      onSelect(newSet);
    } else {
      const isAlreadySelected = selectedIds.has(visibleIds[idx]);
      setDragStart(idx);
      setDragMode(isAlreadySelected ? 'deselect' : 'select');

      if (isAlreadySelected) {
        const newSet = new Set(selectedIds);
        newSet.delete(visibleIds[idx]);
        onSelect(newSet);
      } else {
        onSelect(new Set([visibleIds[idx]]));
      }
    }
  }, [visibleIds, selectedIds, onSelect]);

  const handleRowMouseEnter = useCallback((idx: number) => {
    if (dragStart === null) return;
    const start = Math.min(dragStart, idx);
    const end = Math.max(dragStart, idx);

    if (dragMode === 'select') {
      const newSet = new Set<string>();
      for (let i = start; i <= end; i++) newSet.add(visibleIds[i]);
      onSelect(newSet);
    } else {
      // Deselect mode: remove the dragged range from current selection
      const newSet = new Set(selectedIds);
      for (let i = start; i <= end; i++) newSet.delete(visibleIds[i]);
      onSelect(newSet);
    }
  }, [dragStart, dragMode, visibleIds, selectedIds, onSelect]);

  useEffect(() => {
    const handleMouseUp = () => setDragStart(null);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Keyboard
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editingCell) {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        commitEdit();
        if (e.key === 'Tab') {
          const fields: EditableField[] = ['codigo', 'descripcion', 'unidad', 'cantidad', 'precioInterno', 'precioCliente'];
          const currentIdx = fields.indexOf(editingCell.field);
          const nextField = fields[currentIdx + 1];
          if (nextField) setTimeout(() => startEdit(editingCell.id, nextField), 0);
          else {
            const rowIdx = visibleIds.indexOf(editingCell.id);
            if (rowIdx < visibleIds.length - 1) setTimeout(() => startEdit(visibleIds[rowIdx + 1], 'codigo'), 0);
          }
        }
      }
      if (e.key === 'Escape') cancelEdit();
    }
  }, [editingCell, commitEdit, cancelEdit, startEdit, visibleIds]);

  const handleDoubleClick = useCallback((id: string, field: EditableField) => {
    const c = conceptos[id];
    if (c?.tipo === 'Capitulo' && c.childrenIds.length > 0 && field === 'descripcion') {
      onToggleExpand(id);
    } else {
      startEdit(id, field);
    }
  }, [conceptos, onToggleExpand, startEdit]);

  // Get root ancestor (nivel 0) of any concept
  const getRootOf = useCallback((id: string): string | null => {
    let current = conceptos[id];
    while (current?.parentId) current = conceptos[current.parentId];
    return current?.id ?? null;
  }, [conceptos]);

  // Get the BC3 category chain of a concept (walk up to find A04#, A0402# etc)
  const getBC3Chain = useCallback((id: string): { subCat: string | null; subSubCat: string | null } => {
    // Walk up from the item to find its BC3 category parents by codigo pattern
    let subCat: string | null = null;
    let subSubCat: string | null = null;
    let walk = conceptos[id];
    while (walk) {
      const code = walk.codigo;
      // SubSubCategory: 4+ digits + # (e.g. A0402#)
      if (code.endsWith('#') && code.length >= 6) subSubCat = code;
      // SubCategory: 2 digits + # (e.g. A04#) — letter + 2 digits + #
      else if (code.endsWith('#') && code.length >= 4 && code.length <= 5) subCat = code;
      walk = walk.parentId ? conceptos[walk.parentId] : undefined;
    }
    return { subCat, subSubCat };
  }, [conceptos]);

  // Check if a concept is a Bloque (direct child of a root Nivel)
  const isBloque = useCallback((id: string): boolean => {
    const c = conceptos[id];
    return !!(c?.parentId && !conceptos[c.parentId]?.parentId);
  }, [conceptos]);

  // Check if a concept is a Nivel (root level, no parent)
  const isNivel = useCallback((id: string): boolean => {
    return !conceptos[id]?.parentId;
  }, [conceptos]);

  // Check if a row drag can drop on a target
  const canRowDropOn = useCallback((targetId: string): boolean => {
    if (!draggingRowId) return false;
    if (draggingRowId === targetId) return false;
    const drag = conceptos[draggingRowId];
    const target = conceptos[targetId];
    if (!drag || !target) return false;

    // Can't drop on own descendant
    let check: ConceptoPresupuesto | undefined = target;
    while (check?.parentId) {
      if (check.parentId === draggingRowId) return false;
      check = conceptos[check.parentId];
    }

    // Reorder among siblings is always OK
    if (target.parentId === drag.parentId) return true;

    // Can drop on a Nivel or Bloque (item will auto-organize)
    if (target.tipo === 'Capitulo') {
      if (isNivel(targetId) || isBloque(targetId)) return true;

      // For other Capitulos, only allow if same BC3 category
      const dragChain = getBC3Chain(draggingRowId);
      const targetCode = target.codigo;

      // Target is a BC3 category — check if it matches the dragged item's chain
      if (dragChain.subCat && targetCode === dragChain.subCat) return true;
      if (dragChain.subSubCat && targetCode === dragChain.subSubCat) return true;

      // Target contains the right category as a child
      // (e.g. target is a bloque-like structure that has A04# inside)
      return false;
    }

    return false;
  }, [draggingRowId, conceptos, isNivel, isBloque, getBC3Chain]);

  // Drop handlers — supports BC3 items and internal row reordering
  const handleDragOver = useCallback((e: React.DragEvent, targetId: string | null) => {
    const isBC3 = e.dataTransfer.types.includes('application/x-bc3-item');
    const isRow = e.dataTransfer.types.includes('application/x-row-id');

    if (isBC3) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';

      // Determine the smart drop target for BC3 items
      let smartTarget: string | null = null;

      if (targetId) {
        const target = conceptos[targetId];
        if (!target) {
          // No target
        } else if (!target.parentId) {
          // Target is a root-level Nivel (NIVEL 1, NIVEL 2, etc.)
          // Bounding box wraps the entire Nivel — item lands as sibling of bloques
          smartTarget = targetId;
        } else {
          // Target is inside a Nivel — find the Bloque (direct child of Nivel)
          let walk: ConceptoPresupuesto | undefined = target;
          while (walk) {
            // A bloque is a direct child of a root Nivel
            if (walk.parentId && !conceptos[walk.parentId]?.parentId) {
              smartTarget = walk.id;
              break;
            }
            if (!walk.parentId) break;
            walk = walk.parentId ? conceptos[walk.parentId] : undefined;
          }
          // If we didn't find a bloque, the target itself might be a bloque
          if (!smartTarget && target.parentId) {
            smartTarget = targetId;
          }
        }
      }

      if (smartTarget !== dropTargetId) onSetDropTarget(smartTarget);
      onSetDropPosition('inside');
    } else if (isRow && targetId) {
      if (canRowDropOn(targetId)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (targetId !== dropTargetId) onSetDropTarget(targetId);

        // Determine position based on cursor Y within the row
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const target = conceptos[targetId];

        if (target?.tipo === 'Capitulo') {
          // For chapters: top third = before, middle = inside, bottom third = after
          if (y < rect.height * 0.3) onSetDropPosition('before');
          else if (y > rect.height * 0.7) onSetDropPosition('after');
          else onSetDropPosition('inside');
        } else {
          // For items: top half = before, bottom half = after
          onSetDropPosition(y < rect.height / 2 ? 'before' : 'after');
        }
      } else {
        onSetDropTarget(null);
        onSetDropPosition(null);
      }
    }
  }, [dropTargetId, onSetDropTarget, onSetDropPosition, canRowDropOn, conceptos, bc3DragPayload]);

  const handleDragLeave = useCallback(() => {
    onSetDropTarget(null);
    onSetDropPosition(null);
  }, [onSetDropTarget, onSetDropPosition]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    const pos = dropPosition;
    const bc3Target = dropTargetId; // For BC3: this is the bloque
    onSetDropTarget(null);
    onSetDropPosition(null);
    onSetBC3DragPayload(null);

    // BC3 catalog drop — always drops into the bloque (not the specific row)
    const bc3Data = e.dataTransfer.getData('application/x-bc3-item');
    if (bc3Data) {
      try {
        const payload: BC3DragPayload = JSON.parse(bc3Data);
        onDropBC3(payload, bc3Target, 1);
      } catch { /* ignore */ }
      return;
    }

    // Internal row move
    const rowId = e.dataTransfer.getData('application/x-row-id');
    if (rowId && targetId && rowId !== targetId && pos) {
      if (pos === 'inside') {
        onMoveRow(rowId, targetId, 'inside');
      } else if (pos === 'before') {
        onMoveRow(rowId, targetId, 'before');
      } else if (pos === 'after') {
        onMoveRow(rowId, targetId, 'after');
      }
    }
  }, [onDropBC3, onMoveRow, onSetDropTarget, onSetDropPosition, dropPosition]);

  // Cell renderer
  const renderCell = (id: string, field: EditableField, extraClass: string = '') => {
    const c = conceptos[id];
    if (!c) return null;
    const isEditing = editingCell?.id === id && editingCell?.field === field;
    const isNumeric = NUMERIC_FIELDS.includes(field);
    const isChapter = c.tipo === 'Capitulo';
    const value = c[field];
    const isOverridden = c.overrides?.[field as OverridableField] !== undefined;

    if (isEditing) {
      return (
        <div className="w-full h-full cell-edit-ring rounded-sm">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className={`w-full h-full px-2 py-0 text-[11px] border-0 outline-none bg-transparent ${isNumeric ? 'text-right font-mono-num' : ''}`}
          />
        </div>
      );
    }

    const displayValue = isNumeric
      ? (isChapter ? '' : formatMoney(value as number))
      : (value ?? '');

    return (
      <div
        className={`w-full h-full flex items-center text-[11px] cursor-default relative group/cell ${
          isNumeric ? 'justify-end font-mono-num' : ''
        } ${isChapter && field === 'descripcion' ? 'font-semibold tracking-tight text-slate-800' : ''} ${
          isOverridden ? 'bg-red-50/70 border-l-2 border-red-400' : ''
        } ${extraClass}`}
        onClick={() => { if (!isChapter || !isNumeric) startEdit(id, field); }}
        onDoubleClick={() => handleDoubleClick(id, field)}
      >
        <span className={`truncate flex-1 ${isNumeric ? 'text-right' : ''} ${isOverridden ? 'text-red-600 font-bold px-2' : 'px-2'}`}>
          {displayValue}
        </span>
        {isOverridden && (
          <button
            className="absolute top-1/2 -translate-y-1/2 right-1 w-5 h-5 flex items-center justify-center rounded bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover/cell:opacity-100"
            onClick={e => { e.stopPropagation(); onRevertOverride(id, field as OverridableField); }}
            title="Revertir al original"
          >
            <Undo2 size={10} strokeWidth={2.5} />
          </button>
        )}
      </div>
    );
  };

  const grandTotalCliente = visibleIds.reduce((sum, id) => sum + getTotal(id), 0);
  const grandTotalInterno = visibleIds.reduce((sum, id) => sum + getTotalInterno(id), 0);

  return (
    <div
      className="flex-1 overflow-auto select-none"
      onKeyDown={handleKeyDown}
      onDragOver={e => handleDragOver(e, null)}
      onDragLeave={handleDragLeave}
      onDrop={e => handleDrop(e, null)}
    >
      {/* Column headers */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="grid text-[9px] font-bold text-slate-400 uppercase tracking-[0.08em]"
          style={{ gridTemplateColumns: COL_TEMPLATE }}
        >
          {['#', 'NatC', 'Codigo', 'Descripcion', 'Ud', 'Cantidad', 'P.Ref', 'P.Interno', 'P.Cliente', 'Importe', ''].map(
            (label, i) => (
              <div key={label} className={`px-2 py-2.5 ${i < 9 ? 'border-r border-slate-100' : ''} ${i >= 5 ? 'text-right' : i === 0 ? 'text-center' : ''}`}>
                {label}
              </div>
            )
          )}
        </div>
      </div>

      {/* Rows */}
      {visibleIds.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 blueprint-grid min-h-[400px]"
          onDragOver={e => handleDragOver(e, null)}
          onDrop={e => handleDrop(e, null)}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            dropTargetId === null && false ? 'bg-blue-100 border-2 border-blue-400 border-dashed' : 'bg-slate-100'
          }`}>
            <ClipboardPaste size={24} className="text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-400 tracking-tight">Sin partidas</p>
          <p className="text-[11px] text-slate-400/60 mt-1.5 max-w-xs text-center leading-relaxed">
            Arrastra desde el catalogo BC3, pega desde Excel con <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono-num border border-slate-200">Ctrl+V</kbd>, o presiona <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono-num border border-slate-200">Enter</kbd>
          </p>
        </div>
      ) : (
        visibleIds.map((id, idx) => {
          const c = conceptos[id];
          if (!c) return null;
          const isSelected = selectedIds.has(id);
          const isChapter = c.tipo === 'Capitulo';
          const hasChildren = c.childrenIds.length > 0;
          const total = getTotal(id);
          const isDropTarget = dropTargetId === id;
          const isComponentInstance = !!c.componentSourceId;
          const isComponentSource = !!c.isComponentSource;

          // Check if this row is the drop target or a DESCENDANT of it (for bounding box)
          let isInDropGroup = false;
          let isFirstInDropGroup = false;
          let isLastInDropGroup = false;

          if (dropTargetId && dropPosition === 'inside') {
            if (isDropTarget) {
              isInDropGroup = true;
            } else {
              // Check if this row is a descendant of the dropTarget (walk UP from this row)
              let walk = c.parentId ? conceptos[c.parentId] : undefined;
              while (walk) {
                if (walk.id === dropTargetId) { isInDropGroup = true; break; }
                walk = walk.parentId ? conceptos[walk.parentId] : undefined;
              }
            }

            if (isInDropGroup) {
              const checkGroupAt = (i: number): boolean => {
                const oid = visibleIds[i];
                if (!oid) return false;
                if (oid === dropTargetId) return true;
                let w = conceptos[oid]?.parentId ? conceptos[conceptos[oid].parentId!] : undefined;
                while (w) {
                  if (w.id === dropTargetId) return true;
                  w = w.parentId ? conceptos[w.parentId] : undefined;
                }
                return false;
              };
              if (idx === 0 || !checkGroupAt(idx - 1)) isFirstInDropGroup = true;
              if (idx === visibleIds.length - 1 || !checkGroupAt(idx + 1)) isLastInDropGroup = true;
            }
          }

          // For BC3 drops, only Capitulos can receive. For row moves, all rows are valid targets.
          const canDrop = isChapter; // BC3: only folders. Row drag shows blue line on all.

          // Nivel-based backgrounds + left border color
          const nivelStyles = [
            { bg: 'bg-white',          border: '',                                hover: 'hover:bg-slate-50' },
            { bg: 'bg-blue-50/60',     border: 'border-l-4 border-l-blue-500',    hover: 'hover:bg-blue-100/50' },
            { bg: 'bg-emerald-50/50',  border: 'border-l-4 border-l-emerald-500', hover: 'hover:bg-emerald-100/50' },
            { bg: 'bg-amber-50/50',    border: 'border-l-4 border-l-amber-500',   hover: 'hover:bg-amber-100/50' },
          ];
          const ns = nivelStyles[Math.min(c.nivel, nivelStyles.length - 1)];
          const nivelBg = ns.bg;
          const nivelBorder = ns.border;
          const nivelHover = ns.hover;

          return (
            <div
              key={id}
              className={`grid border-b transition-all duration-75 relative ${
                isInDropGroup
                  ? 'bg-blue-50/60'
                  : isSelected
                    ? 'bg-blue-50/80 border-blue-100'
                    : isChapter
                      ? `${nivelBg} ${nivelBorder} border-slate-100 ${nivelHover}`
                      : `${nivelBg} ${nivelBorder} border-slate-100/60 ${nivelHover}`
              }`}
              style={{
                gridTemplateColumns: COL_TEMPLATE, height: 34,
                ...(isInDropGroup ? {
                  borderLeft: '3px solid #3b82f6',
                  borderRight: '3px solid #3b82f6',
                  borderTop: isFirstInDropGroup ? '3px solid #3b82f6' : undefined,
                  borderBottom: isLastInDropGroup ? '3px solid #3b82f6' : undefined,
                  borderRadius: isFirstInDropGroup && isLastInDropGroup ? '8px' : isFirstInDropGroup ? '8px 8px 0 0' : isLastInDropGroup ? '0 0 8px 8px' : undefined,
                } : {}),
              }}
              draggable={!isChapter}
              onDragStart={!isChapter ? e => {
                e.dataTransfer.setData('application/x-row-id', id);
                e.dataTransfer.effectAllowed = 'move';
                setDraggingRowId(id);
              } : undefined}
              onDragEnd={() => { setDraggingRowId(null); onSetDropTarget(null); onSetBC3DragPayload(null); }}
              onDragOver={e => { e.stopPropagation(); e.preventDefault(); handleDragOver(e, id); }}
              onDragLeave={handleDragLeave}
              onDrop={e => { e.stopPropagation(); handleDrop(e, id); }}
            >
              {/* Drop indicator line — top, bottom, or full highlight for inside */}
              {isDropTarget && dropPosition === 'before' && (
                <div className="absolute -top-[1.5px] left-0 right-0 h-[3px] z-20 pointer-events-none rounded-full bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.5)]">
                  <div className="absolute -left-1 -top-[3px] w-[9px] h-[9px] rounded-full border-2 border-white shadow bg-blue-500" />
                </div>
              )}
              {isDropTarget && dropPosition === 'after' && (
                <div className="absolute -bottom-[1.5px] left-0 right-0 h-[3px] z-20 pointer-events-none rounded-full bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.5)]">
                  <div className="absolute -left-1 -top-[3px] w-[9px] h-[9px] rounded-full border-2 border-white shadow bg-blue-500" />
                </div>
              )}

              {/* Selection stripe */}
              {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 rounded-r-sm" />}

              {/* Component indicator stripe */}
              {isComponentSource && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-violet-500 rounded-l-sm" />}
              {isComponentInstance && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-cyan-400 rounded-l-sm" />}

              {/* Row number — soft color matches nivel */}
              <div
                className={`flex items-center justify-center text-[10px] cursor-pointer border-r transition-colors duration-75 ${
                  isSelected
                    ? c.nivel === 0
                      ? 'bg-slate-200 text-slate-700 font-bold border-slate-200'
                      : c.nivel === 1
                        ? 'bg-blue-100 text-blue-700 font-bold border-blue-100'
                        : c.nivel === 2
                          ? 'bg-emerald-100 text-emerald-700 font-bold border-emerald-100'
                          : 'bg-amber-100 text-amber-700 font-bold border-amber-100'
                    : 'text-slate-400 border-slate-100/60 hover:bg-slate-100 hover:text-slate-600'
                }`}
                onMouseDown={e => handleRowMouseDown(idx, e)}
                onMouseEnter={() => handleRowMouseEnter(idx)}
              >
                <span className="font-mono-num">{idx + 1}</span>
              </div>

              {/* Tipo badge */}
              <div className="flex items-center justify-center border-r border-slate-100/60 relative">
                <TipoBadge tipo={c.tipo} />
                {isComponentSource && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-violet-500 border border-white" title="Componente fuente" />
                )}
              </div>

              {/* Codigo — auto-generated from tree position */}
              <div className="border-r border-slate-100/60">
                <div className="flex items-center h-full gap-0.5 px-2">
                  {isComponentInstance && <Link2 size={9} className="text-cyan-400 shrink-0" />}
                  <span className="text-[11px] font-mono-num text-slate-400 truncate">
                    {buildAutoCode(id, conceptos, rootIds)}
                  </span>
                </div>
              </div>

              {/* Descripcion — with indentation and expand toggle */}
              <div className="border-r border-slate-100/60">
                <div className="flex items-center h-full">
                  {/* Indentation spacer based on nivel */}
                  {c.nivel > 0 && (
                    <div style={{ width: c.nivel * 20 }} className="shrink-0 h-full relative">
                      {/* Tree guide line */}
                      <div className="absolute right-0 top-0 bottom-0 w-px bg-slate-200/50" />
                    </div>
                  )}
                  {/* Expand/collapse toggle for chapters with children */}
                  {isChapter && hasChildren ? (
                    <button
                      className="mx-0.5 p-0.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                      onClick={() => onToggleExpand(id)}
                    >
                      {expandedIds.has(id)
                        ? <ChevronDown size={13} strokeWidth={2.5} />
                        : <ChevronRight size={13} strokeWidth={2.5} />
                      }
                    </button>
                  ) : (
                    <div className="w-5 shrink-0" />
                  )}
                  {renderCell(id, 'descripcion')}
                </div>
              </div>

              {/* Unidad */}
              <div className="border-r border-slate-100/60">
                {renderCell(id, 'unidad', 'text-slate-400 uppercase text-[9px] font-semibold tracking-wider')}
              </div>

              {/* Cantidad */}
              <div className="border-r border-slate-100/60">
                {renderCell(id, 'cantidad', c.overrides?.cantidad !== undefined ? '' : 'text-slate-700')}
              </div>

              {/* P.Ref BC3 */}
              <div className="border-r border-slate-100/60">
                {renderCell(id, 'precioRef', c.overrides?.precioRef !== undefined ? '' : 'text-slate-300')}
              </div>

              {/* P.Interno */}
              <div className="border-r border-slate-100/60">
                {renderCell(id, 'precioInterno', c.overrides?.precioInterno !== undefined ? '' : 'text-amber-600/80')}
              </div>

              {/* P.Cliente */}
              <div className="border-r border-slate-100/60">
                {renderCell(id, 'precioCliente', c.overrides?.precioCliente !== undefined ? '' : 'text-slate-700')}
              </div>

              {/* Total */}
              <div className="flex items-center justify-end px-2.5">
                <span className={`text-[11px] font-mono-num font-bold ${isChapter ? 'text-blue-700' : 'text-slate-800'}`}>
                  {formatMoney(total)}
                </span>
              </div>

              {/* Actions — only for Niveles and non-BC3 folders */}
              <div className="flex items-center justify-center gap-0.5">
                {(() => {
                  const isBC3Folder = c.codigo.endsWith('#');
                  const isRootNivel = !c.parentId;
                  const canCreateFolder = isChapter && !isBC3Folder;

                  return (
                    <>
                      {canCreateFolder && (
                        <button
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          onClick={e => { e.stopPropagation(); onCreateFolder(id); }}
                          title="Crear carpeta"
                        >
                          <FolderPlus size={13} />
                        </button>
                      )}
                      {isRootNivel && (
                        <button
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          onClick={e => { e.stopPropagation(); setConfirmDeleteId(id); }}
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })
      )}

      {/* Footer totals */}
      {visibleIds.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t-2 border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="grid" style={{ gridTemplateColumns: COL_TEMPLATE, height: 40 }}>
            <div className="col-span-6 flex items-center pl-3">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total general</span>
            </div>
            <div />
            <div className="flex items-center justify-end px-2 border-r border-slate-100">
              <div className="text-right">
                <div className="text-[8px] text-amber-500/60 uppercase font-bold tracking-wider leading-none mb-0.5">Interno</div>
                <span className="text-[12px] font-mono-num font-bold text-amber-600">{formatMoney(grandTotalInterno)}</span>
              </div>
            </div>
            <div />
            <div className="flex items-center justify-end px-2.5 bg-blue-50/50">
              <div className="text-right">
                <div className="text-[8px] text-blue-500/60 uppercase font-bold tracking-wider leading-none mb-0.5">Cliente</div>
                <span className="text-[13px] font-mono-num font-bold text-blue-700">{formatMoney(grandTotalCliente)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[380px] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Eliminar</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {conceptos[confirmDeleteId]?.descripcion}
                </p>
              </div>
            </div>
            <p className="text-[12px] text-slate-600 mb-4">
              Se eliminara este elemento y todo su contenido. Esta accion no se puede deshacer.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onDeleteConcepto(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Si, eliminar
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
