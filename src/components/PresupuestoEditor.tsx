import { useState, useCallback, useEffect } from 'react';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { BC3Panel } from './BC3Panel';
import { FloatingToolbar } from './FloatingToolbar';
import { PresupuestoGrid } from './PresupuestoGrid';
import { PropagationDialog } from './PropagationDialog';
import { AddBloqueNivelModal } from './AddBloqueNivelModal';
import { formatMoney } from '../utils/formatters';
import { parsePastedRows } from '../utils/formatters';
import {
  Undo2, Redo2, FileDown, Save, Building2, TrendingUp
} from 'lucide-react';

export function PresupuestoEditor() {
  const store = usePresupuesto();
  const [bc3Open, setBc3Open] = useState(true);
  const [showBloqueModal, setShowBloqueModal] = useState(false);

  const visibleIds = store.getVisibleIds();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === 'ArrowUp') { e.preventDefault(); store.moveSelected('up'); }
        if (e.key === 'ArrowDown') { e.preventDefault(); store.moveSelected('down'); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); store.outdentSelected(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); store.indentSelected(); }
      }
      if (e.key === 'Delete' && store.selectedIds.size > 0) {
        e.preventDefault();
        store.deleteSelected();
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
  }, [store]);

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

            <div className="flex items-center gap-0.5">
              {[
                { icon: Undo2, title: 'Deshacer' },
                { icon: Redo2, title: 'Rehacer' },
                { icon: FileDown, title: 'Exportar' },
                { icon: Save, title: 'Guardar' },
              ].map(({ icon: Icon, title }) => (
                <button key={title} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title={title}>
                  <Icon size={15} strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Sub-toolbar ── */}
      <div className="bg-white border-b border-slate-200/60 px-5 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBloqueModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200/50"
          >
            <Building2 size={13} strokeWidth={2.5} /> Bloques y Niveles
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono-num">
          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-semibold">{visibleIds.length}</span>
          <span>items</span>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex overflow-hidden">
        <BC3Panel
          isOpen={bc3Open}
          onToggle={() => setBc3Open(!bc3Open)}
          onAddItem={store.addFromBC3}
          selectedCapituloId={store.getSelectedCapituloId()}
        />
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <PresupuestoGrid
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
            getTotal={store.getTotal}
            getTotalInterno={store.getTotalInterno}
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
        onDelete={store.deleteSelected}
        onChangeTipo={store.changeTipoSelected}
        onCopyAsComponent={handleCopyAsComponent}
        onCopyAsIndependent={handleCopyAsIndependent}
      />

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
            // Create a child Capitulo under the bloque
            const id = store.addConcepto(bloqueId, 'Capitulo');
            store.updateConcepto(id, { descripcion: nombre, codigo: numero < 0 ? `S${Math.abs(numero)}` : numero === 0 ? 'PB' : `N${numero}` });
            store.toggleExpanded(bloqueId);
          }}
          onClose={() => setShowBloqueModal(false)}
        />
      )}
    </div>
  );
}
