import { useState, useRef, useCallback, useEffect } from 'react';
import type { ConceptoPresupuesto, OverridableField, BC3DragPayload } from '../types';
import { TipoBadge } from './TipoBadge';
import { formatMoney } from '../utils/formatters';
import { TIPO_CONFIG } from '../utils/tipoConfig';
import { ChevronRight, ChevronDown, ClipboardPaste, Undo2, Link2 } from 'lucide-react';

interface Props {
  visibleIds: string[];
  conceptos: Record<string, ConceptoPresupuesto>;
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  onSelect: (ids: Set<string>) => void;
  onToggleExpand: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ConceptoPresupuesto>) => void;
  onRevertOverride: (id: string, field: OverridableField) => void;
  onDropBC3: (payload: BC3DragPayload, targetId: string | null, cantidad: number) => void;
  dropTargetId: string | null;
  onSetDropTarget: (id: string | null) => void;
  getTotal: (id: string) => number;
  getTotalInterno: (id: string) => number;
}

type EditableField = 'codigo' | 'descripcion' | 'unidad' | 'cantidad' | 'precioRef' | 'precioInterno' | 'precioCliente';

const NUMERIC_FIELDS: EditableField[] = ['cantidad', 'precioRef', 'precioInterno', 'precioCliente'];
const COL_TEMPLATE = '42px 36px 84px 1fr 48px 96px 96px 96px 96px 120px';

export function PresupuestoGrid({
  visibleIds, conceptos, selectedIds, expandedIds, onSelect, onToggleExpand, onUpdate,
  onRevertOverride, onDropBC3, dropTargetId, onSetDropTarget,
  getTotal, getTotalInterno,
}: Props) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: EditableField } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [dragStart, setDragStart] = useState<number | null>(null);
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
      // Toggle: click on already-selected row deselects it
      if (selectedIds.size === 1 && selectedIds.has(visibleIds[idx])) {
        onSelect(new Set());
      } else {
        setDragStart(idx);
        onSelect(new Set([visibleIds[idx]]));
      }
    }
  }, [visibleIds, selectedIds, onSelect]);

  const handleRowMouseEnter = useCallback((idx: number) => {
    if (dragStart !== null) {
      const start = Math.min(dragStart, idx);
      const end = Math.max(dragStart, idx);
      const newSet = new Set<string>();
      for (let i = start; i <= end; i++) newSet.add(visibleIds[i]);
      onSelect(newSet);
    }
  }, [dragStart, visibleIds, onSelect]);

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

  // Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent, targetId: string | null) => {
    if (e.dataTransfer.types.includes('application/x-bc3-item')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      if (targetId !== dropTargetId) onSetDropTarget(targetId);
    }
  }, [dropTargetId, onSetDropTarget]);

  const handleDragLeave = useCallback(() => {
    onSetDropTarget(null);
  }, [onSetDropTarget]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    onSetDropTarget(null);
    const data = e.dataTransfer.getData('application/x-bc3-item');
    if (!data) return;
    try {
      const payload: BC3DragPayload = JSON.parse(data);
      onDropBC3(payload, targetId, 1);
    } catch { /* ignore bad data */ }
  }, [onDropBC3, onSetDropTarget]);

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
          {['#', 'NatC', 'Codigo', 'Descripcion', 'Ud', 'Cantidad', 'P.Ref', 'P.Interno', 'P.Cliente', 'Importe'].map(
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

          return (
            <div
              key={id}
              className={`grid border-b transition-all duration-75 relative ${
                isDropTarget
                  ? 'bg-blue-100/80 border-blue-200'
                  : isSelected
                    ? 'bg-blue-50/80 border-blue-100'
                    : isChapter
                      ? 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                      : 'border-slate-100/60 row-hover-glow'
              }`}
              style={{ gridTemplateColumns: COL_TEMPLATE, height: 34 }}
              onDragOver={e => { e.stopPropagation(); e.preventDefault(); handleDragOver(e, id); }}
              onDragLeave={handleDragLeave}
              onDrop={e => { e.stopPropagation(); handleDrop(e, id); }}
            >
              {/* Drop indicator line — sits on top edge of the row */}
              {isDropTarget && (
                <div className="absolute -top-[1.5px] left-0 right-0 h-[3px] bg-blue-500 z-20 pointer-events-none rounded-full shadow-[0_0_6px_rgba(37,99,235,0.5)]">
                  <div className="absolute -left-1 -top-[3px] w-[9px] h-[9px] rounded-full bg-blue-500 border-2 border-white shadow" />
                </div>
              )}

              {/* Selection stripe */}
              {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 rounded-r-sm" />}

              {/* Component indicator stripe */}
              {isComponentSource && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-violet-500 rounded-l-sm" />}
              {isComponentInstance && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-cyan-400 rounded-l-sm" />}

              {/* Row number */}
              <div
                className={`flex items-center justify-center text-[10px] cursor-pointer border-r transition-colors duration-75 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold border-blue-600'
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

              {/* Codigo */}
              <div className="border-r border-slate-100/60">
                <div className="flex items-center h-full gap-0.5">
                  {isComponentInstance && <Link2 size={9} className="text-cyan-400 ml-1 shrink-0" />}
                  {renderCell(id, 'codigo', 'font-mono-num text-slate-500')}
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
    </div>
  );
}
