import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { BC3Panel } from './BC3Panel';
import { FloatingToolbar } from './FloatingToolbar';
import { PresupuestoGrid } from './PresupuestoGrid';
import { PropagationDialog } from './PropagationDialog';
import { AddBloqueNivelModal } from './AddBloqueNivelModal';
import { ZoomControl } from './ZoomControl';
import { TotalGeneralPanel } from './TotalGeneralPanel';
import { SearchBar } from './SearchBar';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { CreateComponenteModal } from './CreateComponenteModal';
import { ComponentePicker, buildCopyDestinations } from './ComponentePicker';
import { DeleteFolderModal } from './DeleteFolderModal';
import { groupInstancesByAnchor, findInstanceAnchor } from '../utils/componenteUtils';
import { normalizeText } from '../utils/searchUtils';
import { formatMoney } from '../utils/formatters';
import { parsePastedRows } from '../utils/formatters';
import { exportToBC3, downloadBlob } from '../utils/exportBC3';
import { exportToExcel } from '../utils/exportExcel';
import { exportToPDF } from '../utils/exportPDF';
import {
  Undo2, Redo2, FileDown, Save, Building2, TrendingUp,
  FileSpreadsheet, FileText, FileCode,
  FolderTree, Unlink, Trash2, Pencil, BoxSelect, Plus,
} from 'lucide-react';

export function PresupuestoEditor() {
  const store = usePresupuesto();
  const [bc3Open, setBc3Open] = useState(true);
  const [showBloqueModal, setShowBloqueModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [zoom, setZoom] = useState<number>(() => {
    const saved = localStorage.getItem('intentodepresto.zoom');
    const parsed = saved ? Number(saved) : 100;
    return Number.isFinite(parsed) && parsed >= 50 && parsed <= 200 ? parsed : 100;
  });
  const [footerHeight, setFooterHeight] = useState<number>(() => {
    const saved = localStorage.getItem('intentodepresto.footerHeight');
    const parsed = saved ? Number(saved) : 64;
    return Number.isFinite(parsed) && parsed >= 56 && parsed <= 400 ? parsed : 64;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('intentodepresto.zoom', String(zoom));
  }, [zoom]);

  useEffect(() => {
    localStorage.setItem('intentodepresto.footerHeight', String(footerHeight));
  }, [footerHeight]);

  const baseVisibleIds = store.getVisibleIds();

  // Filtered visible IDs based on search query.
  // When searching: matches + all their ancestors, ignoring expand/collapse state.
  // When empty: respects normal expand/collapse via getVisibleIds.
  const { visibleIds, searchMatchCount } = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return { visibleIds: baseVisibleIds, searchMatchCount: null as number | null };
    }
    const q = normalizeText(trimmed);
    const matches = new Set<string>();
    for (const id in store.conceptos) {
      const c = store.conceptos[id];
      if (!c) continue;
      const desc = normalizeText(c.descripcion);
      const cod = normalizeText(c.codigo);
      if (desc.includes(q) || cod.includes(q)) matches.add(id);
    }

    // Expand each match with all its ancestors so the tree context is preserved.
    const visible = new Set<string>();
    for (const id of matches) {
      let cur: string | null | undefined = id;
      while (cur) {
        if (visible.has(cur)) break;
        visible.add(cur);
        cur = store.conceptos[cur]?.parentId ?? null;
      }
    }

    // Walk the tree in DFS order from rootIds, only including IDs in `visible`.
    const ordered: string[] = [];
    const walk = (id: string) => {
      if (!visible.has(id)) return;
      ordered.push(id);
      const c = store.conceptos[id];
      if (!c) return;
      for (const childId of c.childrenIds) walk(childId);
    };
    for (const rootId of store.rootIds) walk(rootId);

    return { visibleIds: ordered, searchMatchCount: matches.size };
  }, [searchQuery, store.conceptos, store.rootIds, baseVisibleIds]);

  // ── Delete folder modal ──
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(null);

  /**
   * Handler central de borrado individual (trash del row). Si el target es un
   * Capitulo con hijos, abre el modal con las 3 opciones. Si no, borra directo.
   */
  const requestDelete = useCallback(
    (id: string) => {
      const item = store.conceptos[id];
      if (!item) return;
      const isFolderWithChildren = item.tipo === 'Capitulo' && item.childrenIds.length > 0;
      if (isFolderWithChildren) {
        setDeleteFolderTarget(id);
      } else {
        store.deleteConcepto(id);
      }
    },
    [store],
  );

  /**
   * Wrapper del botón Delete de la FloatingToolbar y la tecla Delete.
   * Si la selección es un único Capitulo con hijos, abre el modal. Si son varios
   * o no es carpeta, delega al deleteSelected del store.
   */
  const handleToolbarDelete = useCallback(() => {
    if (store.selectedIds.size === 1) {
      const id = Array.from(store.selectedIds)[0];
      const item = store.conceptos[id];
      if (item && item.tipo === 'Capitulo' && item.childrenIds.length > 0) {
        setDeleteFolderTarget(id);
        return;
      }
    }
    store.deleteSelected();
  }, [store]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        const active = document.activeElement;
        if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (e.shiftKey) {
          store.redo();
        } else {
          store.undo();
        }
      }
      if (e.altKey) {
        if (e.key === 'ArrowUp') { e.preventDefault(); store.moveSelected('up'); }
        if (e.key === 'ArrowDown') { e.preventDefault(); store.moveSelected('down'); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); store.outdentSelected(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); store.indentSelected(); }
      }
      if (e.key === 'Delete' && store.selectedIds.size > 0) {
        e.preventDefault();
        handleToolbarDelete();
      }
      if (e.key === 'Escape') store.setSelectedIds(new Set());
      if (e.key === 'Tab' && store.selectedIds.size > 0) {
        const active = document.activeElement;
        if (active?.tagName !== 'INPUT' && active?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          store.setSelectedIds(new Set());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store, handleToolbarDelete]);

  // Paste from Excel
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const active = document.activeElement;
      if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return;
      const text = e.clipboardData?.getData('text/plain');
      if (!text) return;
      const rows = parsePastedRows(text);
      if (rows.length > 0 && rows[0].length > 1) {
        e.preventDefault();
        store.pasteFromClipboard(rows);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [store]);

  const handleCopyAsComponent = useCallback(() => {
    const selCapId = store.getSelectedCapituloId();
    store.copyAsComponent(selCapId);
  }, [store]);

  const handleCopyAsIndependent = useCallback(() => {
    const selCapId = store.getSelectedCapituloId();
    store.copyAsIndependent(selCapId);
  }, [store]);

  const handleCreateFolder = useCallback(() => {
    setNewFolderName('');
    setShowFolderModal(true);
  }, []);

  // ── Sistema de componentes (nuevo) ──
  const [showCreateComponenteModal, setShowCreateComponenteModal] = useState(false);
  const [pendingCreateIds, setPendingCreateIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowId: string } | null>(null);
  const [pickerState, setPickerState] = useState<
    | { type: 'copy-to'; componenteId: string }
    | { type: 'add-to'; itemId: string }
    | null
  >(null);

  const handleUnify = useCallback(() => {
    const result = store.unifySelected();
    if (!result.ok) {
      window.alert(result.reason ?? 'No se pudo unificar');
    }
  }, [store]);

  // True solo si la selección actual cumple TODAS las reglas de unificación.
  // Si es false el botón Unificar no se renderiza siquiera.
  const canUnifySelection = useMemo(() => {
    if (store.selectedIds.size < 2) return false;
    const items = Array.from(store.selectedIds)
      .map((id) => store.conceptos[id])
      .filter(Boolean);
    if (items.length < 2) return false;
    if (items.some((i) => i.tipo === 'Capitulo')) return false;
    const firstParent = items[0].parentId;
    if (!items.every((i) => i.parentId === firstParent)) return false;
    const ref = items[0];
    return items.every(
      (i) =>
        i.descripcion === ref.descripcion &&
        i.unidad === ref.unidad &&
        i.precioInterno === ref.precioInterno &&
        i.precioCliente === ref.precioCliente,
    );
  }, [store.selectedIds, store.conceptos]);

  const openCreateComponente = useCallback(() => {
    if (store.selectedIds.size < 2) return;
    setPendingCreateIds(Array.from(store.selectedIds));
    setShowCreateComponenteModal(true);
  }, [store.selectedIds]);

  const confirmCreateComponente = useCallback(
    (nombre: string) => {
      if (pendingCreateIds.length === 0) return;
      store.createComponente(pendingCreateIds, nombre);
      setPendingCreateIds([]);
    },
    [pendingCreateIds, store],
  );

  const handleChipClick = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      setContextMenu({ x: e.clientX, y: e.clientY, rowId: itemId });
    },
    [],
  );

  const handleAddToComponente = useCallback((itemId: string) => {
    setPickerState({ type: 'add-to', itemId });
  }, []);

  const handleContextMenuRow = useCallback(
    (rowId: string, e: React.MouseEvent) => {
      setContextMenu({ x: e.clientX, y: e.clientY, rowId });
    },
    [],
  );

  const contextMenuItems = useMemo<ContextMenuItem[]>(() => {
    if (!contextMenu) return [];
    const { rowId } = contextMenu;
    const item = store.conceptos[rowId];
    if (!item) return [];

    const componenteId = item.componenteId;
    const componenteInfo = componenteId ? store.componentes[componenteId] : undefined;

    if (componenteInfo) {
      const instanceCount = Object.values(store.conceptos).filter(
        (c) => c.componenteId === componenteId,
      ).length;
      const anchorCount = groupInstancesByAnchor(store.conceptos, componenteId!).size;
      return [
        {
          label: `Copiar "${componenteInfo.nombre}" a...`,
          icon: FolderTree,
          onClick: () => setPickerState({ type: 'copy-to', componenteId: componenteId! }),
        },
        {
          label: `Seleccionar todas las instancias (${instanceCount})`,
          icon: BoxSelect,
          onClick: () => store.selectAllInstancesOfComponente(componenteId!),
        },
        { label: '', onClick: () => {}, divider: true },
        {
          label: 'Renombrar componente',
          icon: Pencil,
          onClick: () => {
            const nombre = window.prompt('Nuevo nombre del componente:', componenteInfo.nombre);
            if (nombre && nombre.trim()) store.renameComponente(componenteId!, nombre);
          },
        },
        {
          label: 'Hacer único (quitar del componente)',
          icon: Unlink,
          onClick: () => store.removeItemFromComponente(rowId),
        },
        { label: '', onClick: () => {}, divider: true },
        {
          label: `Borrar todas las instancias (${anchorCount} ${anchorCount === 1 ? 'instancia' : 'instancias'})`,
          icon: Trash2,
          danger: true,
          onClick: () => {
            if (window.confirm(`Esto eliminará "${componenteInfo.nombre}" del proyecto entero (${instanceCount} items). ¿Confirmar?`)) {
              store.deleteAllInstancesOfComponente(componenteId!);
            }
          },
        },
      ];
    }

    // Item libre: ofrecer agregarlo a un componente
    const hasComponentes = Object.keys(store.componentes).length > 0;
    return [
      {
        label: 'Agregar al componente...',
        icon: Plus,
        disabled: !hasComponentes,
        onClick: () => setPickerState({ type: 'add-to', itemId: rowId }),
      },
    ];
  }, [contextMenu, store]);

  const copyDestinations = useMemo(() => {
    if (pickerState?.type !== 'copy-to') return [];
    const groups = groupInstancesByAnchor(store.conceptos, pickerState.componenteId);
    const excluded = new Set<string>(groups.keys());
    return buildCopyDestinations(store.conceptos, store.rootIds, excluded);
  }, [pickerState, store.conceptos, store.rootIds]);

  const confirmCopyTo = useCallback(
    (destId: string) => {
      if (pickerState?.type !== 'copy-to') return;
      const result = store.copyComponenteTo(pickerState.componenteId, destId);
      if (!result.ok) {
        window.alert(result.reason ?? 'No se pudo copiar');
      }
    },
    [pickerState, store],
  );

  const confirmAddTo = useCallback(
    (componenteId: string) => {
      if (pickerState?.type !== 'add-to') return;
      const groups = groupInstancesByAnchor(store.conceptos, componenteId);
      const otherInstances = groups.size;
      const sourceAnchor = findInstanceAnchor(store.conceptos, pickerState.itemId);
      const replicaCount = sourceAnchor && groups.has(sourceAnchor) ? otherInstances - 1 : otherInstances;
      if (replicaCount > 0) {
        const ok = window.confirm(
          `Esto agregará el item a las otras ${replicaCount} ${replicaCount === 1 ? 'instancia' : 'instancias'} del componente. ¿Confirmar?`,
        );
        if (!ok) return;
      }
      store.addItemToComponente(pickerState.itemId, componenteId);
    },
    [pickerState, store],
  );

  const handleConfirmFolder = useCallback(() => {
    if (!newFolderName.trim()) return;
    const parentId = store.getSelectedCapituloId();
    const id = store.addConcepto(parentId, 'Capitulo');
    // Direct set to avoid override tracking on new concepts
    store.setConceptoDirectly(id, { descripcion: newFolderName.trim() });
    if (parentId) store.expandId(parentId);
    setShowFolderModal(false);
    setNewFolderName('');
  }, [newFolderName, store]);

  const grandTotal = store.getGrandTotal();
  const grandTotalInterno = store.getGrandTotalInterno();
  const margin = grandTotal > 0 ? ((grandTotal - grandTotalInterno) / grandTotal * 100) : 0;

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-slate-200/80 px-5 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm">
              <Building2 size={16} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-[13px] font-bold text-slate-900 tracking-tight leading-tight">Presupuesto de Obra</h1>
              <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Torre Residencial Los Prados — LOREGO BOSQUILLA SRL</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Totals */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/50">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-amber-500/70 font-bold leading-none">Costo</div>
                  <div className="text-[12px] font-mono-num font-bold text-amber-700 leading-tight">{formatMoney(grandTotalInterno)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/80 border border-blue-200/50">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-blue-500/70 font-bold leading-none">Venta</div>
                  <div className="text-[12px] font-mono-num font-bold text-blue-800 leading-tight">{formatMoney(grandTotal)}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200/50">
                <TrendingUp size={11} className="text-emerald-500" />
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-emerald-500/70 font-bold leading-none">Margen</div>
                  <div className="text-[12px] font-mono-num font-bold text-emerald-700 leading-tight">{margin.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-200" />

            <div className="flex items-center gap-0.5 relative">
              <button
                onClick={store.undo}
                disabled={!store.canUndo}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Deshacer (Ctrl+Z)"
              >
                <Undo2 size={15} strokeWidth={2} />
              </button>
              <button
                onClick={store.redo}
                disabled={!store.canRedo}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Rehacer (Ctrl+Shift+Z)"
              >
                <Redo2 size={15} strokeWidth={2} />
              </button>
              <button
                onClick={() => setExportMenuOpen(v => !v)}
                className={`p-2 rounded-lg transition-colors ${exportMenuOpen ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                title="Exportar"
              >
                <FileDown size={15} strokeWidth={2} />
              </button>
              <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Guardar">
                <Save size={15} strokeWidth={2} />
              </button>

              {exportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 overflow-hidden">
                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Exportar presupuesto</div>
                    <button
                      onClick={() => {
                        const blob = exportToBC3({ conceptos: store.conceptos, rootIds: store.rootIds, projectName: 'Torre Residencial Los Prados' });
                        downloadBlob(blob, 'Torre_Residencial_Los_Prados.bc3');
                        setExportMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileCode size={14} className="text-purple-600" />
                      <div className="flex-1 text-left">
                        <div>BC3 (FIEBDC-3)</div>
                        <div className="text-[9px] text-slate-400">Formato estándar Presto</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportToExcel({ conceptos: store.conceptos, rootIds: store.rootIds, projectName: 'Torre Residencial Los Prados' });
                        setExportMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <div className="flex-1 text-left">
                        <div>Excel (.xlsx)</div>
                        <div className="text-[9px] text-slate-400">Hoja de cálculo con totales</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportToPDF({ conceptos: store.conceptos, rootIds: store.rootIds, projectName: 'Torre Residencial Los Prados', companyName: 'LOREGO BOSQUILLA SRL' });
                        setExportMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileText size={14} className="text-red-600" />
                      <div className="flex-1 text-left">
                        <div>PDF</div>
                        <div className="text-[9px] text-slate-400">Reporte imprimible</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Sub-toolbar ── */}
      <div className="bg-white border-b border-slate-200/60 px-5 py-1.5 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono-num shrink-0">
          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-semibold">{visibleIds.length}</span>
          <span>items</span>
        </div>

        <div className="flex-1 flex justify-center">
          <SearchBar
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={searchMatchCount}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ZoomControl zoom={zoom} onChange={setZoom} />

          <div className="w-px h-6 bg-slate-200" />

          <button
            onClick={() => setShowBloqueModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200/50"
          >
            <Building2 size={13} strokeWidth={2.5} /> Bloques y Niveles
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex overflow-hidden">
        <BC3Panel
          isOpen={bc3Open}
          onToggle={() => setBc3Open(!bc3Open)}
          onAddItem={store.addFromBC3}
          selectedCapituloId={store.getSelectedCapituloId()}
          onSetBC3DragPayload={store.setBC3DragPayload}
        />
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <PresupuestoGrid
            zoom={zoom}
            searchQuery={searchQuery}
            visibleIds={visibleIds}
            rootIds={store.rootIds}
            conceptos={store.conceptos}
            selectedIds={store.selectedIds}
            expandedIds={store.expandedIds}
            onSelect={store.setSelectedIds}
            onToggleExpand={store.toggleExpanded}
            onUpdate={store.updateConcepto}
            onRevertOverride={store.revertOverride}
            onDropBC3={store.addFromBC3WithTarget}
            onMoveRow={store.moveConceptoTo}
            dropTargetId={store.dropTargetId}
            onSetDropTarget={store.setDropTargetId}
            dropPosition={store.dropPosition}
            onSetDropPosition={store.setDropPosition}
            bc3DragPayload={store.bc3DragPayload}
            onSetBC3DragPayload={store.setBC3DragPayload}
            getTotal={store.getTotal}
            getTotalInterno={store.getTotalInterno}
            onCreateFolder={(parentId) => {
              setNewFolderName('');
              setShowFolderModal(true);
              store.setSelectedIds(new Set([parentId]));
            }}
            onDeleteConcepto={store.deleteConcepto}
            onRequestDelete={requestDelete}
            componentes={store.componentes}
            recentlyPropagatedIds={store.recentlyPropagatedIds}
            onChipClick={handleChipClick}
            onAddToComponente={handleAddToComponente}
            onContextMenuRow={handleContextMenuRow}
          />
          <TotalGeneralPanel
            height={footerHeight}
            onHeightChange={setFooterHeight}
            grandTotalInterno={grandTotalInterno}
            grandTotalCliente={grandTotal}
          />
        </div>
      </div>

      {/* ── Floating toolbar ── */}
      <FloatingToolbar
        selectedCount={store.selectedIds.size}
        onMoveUp={() => store.moveSelected('up')}
        onMoveDown={() => store.moveSelected('down')}
        onIndent={store.indentSelected}
        onOutdent={store.outdentSelected}
        onDelete={handleToolbarDelete}
        onChangeTipo={store.changeTipoSelected}
        onCopyAsComponent={handleCopyAsComponent}
        onCopyAsIndependent={handleCopyAsIndependent}
        onCreateFolder={handleCreateFolder}
        onCreateComponente={openCreateComponente}
        onUnify={handleUnify}
        canUnify={canUnifySelection}
        hasCapituloSelected={(() => {
          const selId = store.getSelectedCapituloId();
          if (!selId) return false;
          const c = store.conceptos[selId];
          return !!c && !c.codigo.endsWith('#');
        })()}
      />

      {/* ── New folder modal ── */}
      {showFolderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFolderModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[360px] p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Nueva carpeta</h2>
            <p className="text-[11px] text-slate-500 mb-3">
              {store.getSelectedCapituloId()
                ? `Dentro de: ${store.conceptos[store.getSelectedCapituloId()!]?.descripcion}`
                : 'En la raiz del presupuesto'
              }
            </p>
            <input
              type="text"
              placeholder="Nombre de la carpeta..."
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleConfirmFolder(); if (e.key === 'Escape') setShowFolderModal(false); }}
            />
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleConfirmFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Crear
              </button>
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Propagation dialog ── */}
      {store.pendingPropagation && (
        <PropagationDialog
          sourceId={store.pendingPropagation.sourceId}
          changedFields={store.pendingPropagation.changedFields}
          conceptos={store.conceptos}
          componentSources={store.componentSources}
          onPropagate={store.propagateComponentChange}
          onClose={() => store.setPendingPropagation(null)}
        />
      )}

      {/* ── Modal eliminar carpeta con hijos ── */}
      {deleteFolderTarget && store.conceptos[deleteFolderTarget] && (
        <DeleteFolderModal
          open
          folderName={store.conceptos[deleteFolderTarget].descripcion || '(sin nombre)'}
          childCount={store.conceptos[deleteFolderTarget].childrenIds.length}
          onDeleteAll={() => {
            store.deleteConcepto(deleteFolderTarget);
            setDeleteFolderTarget(null);
          }}
          onKeepChildren={() => {
            store.deleteConceptoKeepingChildren(deleteFolderTarget);
            setDeleteFolderTarget(null);
          }}
          onClose={() => setDeleteFolderTarget(null)}
        />
      )}

      {/* ── Context menu de componentes ── */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* ── Modal crear componente ── */}
      <CreateComponenteModal
        open={showCreateComponenteModal}
        selectedCount={pendingCreateIds.length}
        onConfirm={confirmCreateComponente}
        onClose={() => { setShowCreateComponenteModal(false); setPendingCreateIds([]); }}
      />

      {/* ── Picker: copiar componente a / agregar al componente ── */}
      {pickerState?.type === 'copy-to' && store.componentes[pickerState.componenteId] && (
        <ComponentePicker
          mode="copy-to"
          open
          componenteInfo={store.componentes[pickerState.componenteId]}
          destinations={copyDestinations}
          onPick={confirmCopyTo}
          onClose={() => setPickerState(null)}
        />
      )}
      {pickerState?.type === 'add-to' && (
        <ComponentePicker
          mode="add-to"
          open
          componentes={store.componentes}
          onPick={confirmAddTo}
          onClose={() => setPickerState(null)}
        />
      )}

      {/* ── Bloque/Nivel modal ── */}
      {showBloqueModal && (
        <AddBloqueNivelModal
          conceptos={store.conceptos}
          rootIds={store.rootIds}
          onAddBloque={(nombre, codigo) => {
            // Create a root-level Capitulo for the bloque
            const id = store.addConcepto(null, 'Capitulo');
            store.updateConcepto(id, { descripcion: nombre, codigo: `BLQ-${codigo}` });
          }}
          onAddNivel={(bloqueId, nombre, numero) => {
            // Create a child Capitulo under the bloque — this represents a real
            // construction block linked to factibilidad, so mark esBloque.
            const id = store.addConcepto(bloqueId, 'Capitulo');
            store.setConceptoDirectly(id, {
              descripcion: nombre,
              codigo: numero < 0 ? `S${Math.abs(numero)}` : numero === 0 ? 'PB' : `N${numero}`,
              esBloque: true,
            });
            store.toggleExpanded(bloqueId);
          }}
          onClose={() => setShowBloqueModal(false)}
        />
      )}
    </div>
  );
}
