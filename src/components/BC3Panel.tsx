import { useState, useMemo } from 'react';
import { mockBC3 } from '../data/mockBC3';
import type { BC3Item, BC3DragPayload } from '../types';
import { formatMoney } from '../utils/formatters';
import {
  Search, ChevronRight, ChevronDown, Plus, Upload, Database, X, Package, GripVertical
} from 'lucide-react';

interface Props {
  onAddItem: (item: BC3Item, cantidad: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  selectedCapituloId: string | null;
}

export function BC3Panel({ onAddItem, isOpen, onToggle, selectedCapituloId }: Props) {
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [addingItem, setAddingItem] = useState<BC3Item | null>(null);
  const [addingMeta, setAddingMeta] = useState<{ catCode: string; catName: string; subCode: string; subName: string } | null>(null);
  const [cantidad, setCantidad] = useState('1');

  const filteredData = useMemo(() => {
    if (!search.trim()) return mockBC3.categories;
    const q = search.toLowerCase();
    return mockBC3.categories
      .map(cat => ({
        ...cat,
        children: cat.children
          .map(sub => ({
            ...sub,
            items: sub.items.filter(
              item => item.codigo.toLowerCase().includes(q) || item.descripcion.toLowerCase().includes(q)
            ),
          }))
          .filter(sub => sub.items.length > 0),
      }))
      .filter(cat => cat.children.length > 0);
  }, [search]);

  const toggleCat = (codigo: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(codigo) ? next.delete(codigo) : next.add(codigo);
      return next;
    });
  };

  const toggleSub = (codigo: string) => {
    setExpandedSubs(prev => {
      const next = new Set(prev);
      next.has(codigo) ? next.delete(codigo) : next.add(codigo);
      return next;
    });
  };

  const handleAdd = () => {
    if (addingItem) {
      onAddItem(addingItem, parseFloat(cantidad) || 1);
      setAddingItem(null);
      setAddingMeta(null);
      setCantidad('1');
    }
  };

  const handleDragStart = (
    e: React.DragEvent,
    item: BC3Item,
    catCode: string, catName: string,
    subCode: string, subName: string
  ) => {
    const payload: BC3DragPayload = {
      item,
      categoryCode: catCode,
      categoryName: catName,
      subCategoryCode: subCode,
      subCategoryName: subName,
    };
    e.dataTransfer.setData('application/x-bc3-item', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const startAdding = (item: BC3Item, catCode: string, catName: string, subCode: string, subName: string) => {
    setAddingItem(item);
    setAddingMeta({ catCode, catName, subCode, subName });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 px-1.5 py-3 bg-slate-800 text-slate-400 hover:text-white rounded-r-lg border border-l-0 border-slate-700 shadow-lg hover:bg-slate-700 transition-all duration-200"
        title="Abrir catalogo BC3"
      >
        <Database size={14} />
        <span className="text-[8px] font-bold tracking-widest uppercase" style={{ writingMode: 'vertical-lr' }}>BC3</span>
      </button>
    );
  }

  return (
    <div className="w-72 bg-slate-900 flex flex-col h-full shrink-0 relative noise-overlay">
      {/* Header */}
      <div className="relative z-10 px-3 pt-3 pb-2.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500/15 flex items-center justify-center">
              <Database size={12} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-white tracking-tight">Catalogo BC3</h3>
              <p className="text-[9px] text-slate-500 font-medium">ConstruCosto.do</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors" title="Importar .bc3">
              <Upload size={12} />
            </button>
            <button onClick={onToggle} className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
              <X size={12} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar codigo o descripcion..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-2 text-[11px] rounded-lg bg-slate-800/80 text-slate-200 placeholder-slate-600 border border-slate-700/50 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="relative z-10 flex-1 overflow-y-auto px-1">
        {filteredData.map(cat => (
          <div key={cat.codigo}>
            <button
              onClick={() => toggleCat(cat.codigo)}
              className="w-full flex items-center gap-1.5 px-2 py-2 text-left rounded-md hover:bg-white/5 transition-colors group"
            >
              {expandedCats.has(cat.codigo)
                ? <ChevronDown size={12} className="text-slate-600 group-hover:text-slate-400 shrink-0" />
                : <ChevronRight size={12} className="text-slate-600 group-hover:text-slate-400 shrink-0" />
              }
              <span className="text-[10px] font-mono-num text-cyan-500/70 shrink-0">{cat.codigo}</span>
              <span className="text-[11px] font-semibold text-slate-300 truncate">{cat.nombre}</span>
            </button>

            {expandedCats.has(cat.codigo) && cat.children.map(sub => (
              <div key={sub.codigo} className="ml-2">
                <button
                  onClick={() => toggleSub(sub.codigo)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left rounded-md hover:bg-white/5 transition-colors group"
                >
                  {expandedSubs.has(sub.codigo)
                    ? <ChevronDown size={11} className="text-slate-600 shrink-0" />
                    : <ChevronRight size={11} className="text-slate-600 shrink-0" />
                  }
                  <span className="text-[10px] font-mono-num text-slate-500 shrink-0">{sub.codigo}</span>
                  <span className="text-[10px] font-medium text-slate-400 truncate">{sub.nombre}</span>
                </button>

                {expandedSubs.has(sub.codigo) && (
                  <div className="ml-3 border-l border-slate-800 pl-2 mb-1">
                    {sub.items.map(item => (
                      <div
                        key={item.codigo}
                        draggable
                        onDragStart={e => handleDragStart(e, item, cat.codigo, cat.nombre, sub.codigo, sub.nombre)}
                        className="flex items-start gap-1.5 px-2 py-1.5 rounded-md hover:bg-cyan-500/8 cursor-grab active:cursor-grabbing group/item transition-colors"
                        onClick={() => startAdding(item, cat.codigo, cat.nombre, sub.codigo, sub.nombre)}
                      >
                        <GripVertical size={10} className="text-slate-700 mt-1 shrink-0 opacity-0 group-hover/item:opacity-100" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[9px] font-mono-num text-cyan-500/60">{item.codigo}</span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-tight truncate">{item.descripcion}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-slate-600 uppercase font-medium">{item.unidad}</span>
                            <span className="text-[9px] text-amber-500 font-mono-num font-semibold">
                              ${formatMoney(item.precio)}
                            </span>
                          </div>
                        </div>
                        <button
                          className="opacity-0 group-hover/item:opacity-100 p-1 rounded-md bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 transition-all shrink-0 mt-0.5"
                          onClick={e => { e.stopPropagation(); startAdding(item, cat.codigo, cat.nombre, sub.codigo, sub.nombre); }}
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Add prompt */}
      {addingItem && (
        <div className="relative z-10 border-t border-slate-800 bg-slate-800/60 p-3">
          <div className="flex items-start gap-2 mb-2.5">
            <div className="w-5 h-5 rounded bg-cyan-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Plus size={10} className="text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-200 truncate">{addingItem.descripcion}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono-num text-slate-500">{addingItem.codigo}</span>
                <span className="text-[9px] text-slate-600">·</span>
                <span className="text-[9px] text-slate-500 uppercase">{addingItem.unidad}</span>
                <span className="text-[9px] text-slate-600">·</span>
                <span className="text-[9px] text-amber-500 font-mono-num font-semibold">RD$ {formatMoney(addingItem.precio)}</span>
              </div>
              {selectedCapituloId && (
                <div className="mt-1 text-[9px] text-cyan-400/70 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-cyan-400" />
                  Se agregara dentro de la carpeta seleccionada
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-medium">QTY</span>
              <input
                type="number"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                className="w-full pl-9 pr-2 py-1.5 text-[11px] font-mono-num text-right bg-slate-900 text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddingItem(null); }}
              />
            </div>
            <button onClick={handleAdd} className="px-3 py-1.5 text-[11px] font-semibold bg-cyan-500 text-slate-900 rounded-lg hover:bg-cyan-400 transition-colors">
              Agregar
            </button>
            <button onClick={() => { setAddingItem(null); setCantidad('1'); }} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 px-3 py-2 border-t border-slate-800">
        <div className="text-[9px] text-slate-600 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          Precios de Referencia — Rep. Dominicana
        </div>
      </div>
    </div>
  );
}
