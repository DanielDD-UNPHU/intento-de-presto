import { useState, useMemo, useCallback } from 'react';
import { mockBC3 } from '../data/mockBC3';
import type { BC3Item, BC3DragPayload, BC3SubCategoria, BC3Categoria } from '../types';
import { formatMoney } from '../utils/formatters';
import {
  Search, ChevronRight, ChevronDown, Plus, Upload, Database, X, Package,
  GripVertical, Trash2
} from 'lucide-react';

const UNIDADES = [
  { value: 'M2', label: 'M2 — Metro cuadrado' },
  { value: 'M3', label: 'M3 — Metro cúbico' },
  { value: 'ML', label: 'ML — Metro lineal' },
  { value: 'UND', label: 'UND — Unidad' },
  { value: 'KG', label: 'KG — Kilogramo' },
  { value: 'QQ', label: 'QQ — Quintal' },
  { value: 'LB', label: 'LB — Libra' },
  { value: 'TON', label: 'TON — Tonelada' },
  { value: 'GLB', label: 'GLB — Global' },
  { value: 'PA', label: 'PA — Partida alzada' },
  { value: 'DIA', label: 'DIA — Día (jornal)' },
  { value: 'HR', label: 'HR — Hora' },
  { value: 'SACO', label: 'SACO — Saco' },
  { value: 'VIAJE', label: 'VIAJE — Viaje' },
  { value: 'PTO', label: 'PTO — Punto' },
  { value: 'JGO', label: 'JGO — Juego' },
  { value: 'PAR', label: 'PAR — Par' },
  { value: 'PZA', label: 'PZA — Pieza' },
  { value: 'GAL', label: 'GAL — Galón' },
  { value: 'LT', label: 'LT — Litro' },
  { value: 'PLG', label: 'PLG — Pliego' },
  { value: 'ROLLO', label: 'ROLLO — Rollo' },
];

interface Props {
  onAddItem: (item: BC3Item, cantidad: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  selectedCapituloId: string | null;
}

// Generate next code in sequence for a subcategory
function generateNextCode(subCodigo: string, existingItems: BC3Item[]): string {
  // subCodigo is like "H01#" or "M02#" — strip the #
  const prefix = subCodigo.replace('#', '');

  // Find highest existing number for this prefix
  let maxNum = 0;
  for (const item of existingItems) {
    if (item.codigo.startsWith(prefix)) {
      const numPart = item.codigo.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed;
    }
  }

  // Next in sequence, padded to 3 digits minimum
  const next = maxNum + 1;
  const padded = next.toString().padStart(3, '0');
  return `${prefix}${padded}`;
}

export function BC3Panel({ onAddItem, isOpen, onToggle, selectedCapituloId }: Props) {
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [addingItem, setAddingItem] = useState<BC3Item | null>(null);
  const [cantidad, setCantidad] = useState('1');

  // Custom items added by the user, keyed by subcategory codigo
  const [customItems, setCustomItems] = useState<Record<string, BC3Item[]>>({});

  // Inline form for creating new custom item
  const [creatingIn, setCreatingIn] = useState<{ catCode: string; catName: string; subCode: string; subName: string } | null>(null);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemUnidad, setNewItemUnidad] = useState('');
  const [newItemPrecio, setNewItemPrecio] = useState('');

  // Merge base BC3 + custom items
  const mergedData = useMemo((): BC3Categoria[] => {
    return mockBC3.categories.map(cat => ({
      ...cat,
      children: cat.children.map(sub => ({
        ...sub,
        items: [...sub.items, ...(customItems[sub.codigo] ?? [])],
      })),
    }));
  }, [customItems]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return mergedData;
    const q = search.toLowerCase();
    return mergedData
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
  }, [search, mergedData]);

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
      setCantidad('1');
    }
  };

  const handleDragStart = (
    e: React.DragEvent, item: BC3Item,
    catCode: string, catName: string, subCode: string, subName: string
  ) => {
    const payload: BC3DragPayload = {
      item, categoryCode: catCode, categoryName: catName,
      subCategoryCode: subCode, subCategoryName: subName,
    };
    e.dataTransfer.setData('application/x-bc3-item', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Create custom item
  const handleCreateCustom = useCallback(() => {
    if (!creatingIn || !newItemDesc.trim()) return;

    // Get all items in this subcategory (base + custom) to generate next code
    const baseSub = mockBC3.categories
      .flatMap(c => c.children)
      .find(s => s.codigo === creatingIn.subCode);
    const allItems = [...(baseSub?.items ?? []), ...(customItems[creatingIn.subCode] ?? [])];
    const codigo = generateNextCode(creatingIn.subCode, allItems);

    const newItem: BC3Item = {
      codigo,
      descripcion: newItemDesc.trim(),
      unidad: newItemUnidad.trim().toUpperCase() || 'UND',
      precio: parseFloat(newItemPrecio.replace(/,/g, '')) || 0,
      isCustom: true,
    };

    setCustomItems(prev => ({
      ...prev,
      [creatingIn.subCode]: [...(prev[creatingIn.subCode] ?? []), newItem],
    }));

    // Reset form
    setCreatingIn(null);
    setNewItemDesc('');
    setNewItemUnidad('');
    setNewItemPrecio('');
  }, [creatingIn, newItemDesc, newItemUnidad, newItemPrecio, customItems]);

  const handleDeleteCustom = useCallback((subCode: string, codigo: string) => {
    setCustomItems(prev => ({
      ...prev,
      [subCode]: (prev[subCode] ?? []).filter(i => i.codigo !== codigo),
    }));
  }, []);

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
                <div className="flex items-center">
                  <button
                    onClick={() => toggleSub(sub.codigo)}
                    className="flex-1 flex items-center gap-1.5 px-2 py-1.5 text-left rounded-md hover:bg-white/5 transition-colors group"
                  >
                    {expandedSubs.has(sub.codigo)
                      ? <ChevronDown size={11} className="text-slate-600 shrink-0" />
                      : <ChevronRight size={11} className="text-slate-600 shrink-0" />
                    }
                    <span className="text-[10px] font-mono-num text-slate-500 shrink-0">{sub.codigo}</span>
                    <span className="text-[10px] font-medium text-slate-400 truncate">{sub.nombre}</span>
                  </button>
                  {/* Add custom item button */}
                  <button
                    onClick={() => {
                      setCreatingIn({ catCode: cat.codigo, catName: cat.nombre, subCode: sub.codigo, subName: sub.nombre });
                      if (!expandedSubs.has(sub.codigo)) toggleSub(sub.codigo);
                    }}
                    className="p-1 mr-1 rounded text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title={`Agregar item a ${sub.nombre}`}
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {expandedSubs.has(sub.codigo) && (
                  <div className="ml-3 border-l border-slate-800 pl-2 mb-1">
                    {sub.items.map(item => (
                      <div
                        key={item.codigo}
                        draggable
                        onDragStart={e => handleDragStart(e, item, cat.codigo, cat.nombre, sub.codigo, sub.nombre)}
                        className={`flex items-start gap-1.5 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing group/item transition-colors ${
                          item.isCustom ? 'hover:bg-emerald-500/8' : 'hover:bg-cyan-500/8'
                        }`}
                        onClick={() => setAddingItem(item)}
                      >
                        <GripVertical size={10} className="text-slate-700 mt-1 shrink-0 opacity-0 group-hover/item:opacity-100" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-mono-num ${item.isCustom ? 'text-emerald-500/70' : 'text-cyan-500/60'}`}>
                              {item.codigo}
                            </span>
                            {item.isCustom && (
                              <span className="text-[7px] px-1 py-px rounded bg-emerald-500/15 text-emerald-400 font-bold uppercase">Propio</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-300 leading-tight truncate">{item.descripcion}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-slate-600 uppercase font-medium">{item.unidad}</span>
                            <span className="text-[9px] text-amber-500 font-mono-num font-semibold">
                              ${formatMoney(item.precio)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                          <button
                            className="opacity-0 group-hover/item:opacity-100 p-1 rounded-md bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 transition-all"
                            onClick={e => { e.stopPropagation(); setAddingItem(item); }}
                          >
                            <Plus size={10} />
                          </button>
                          {item.isCustom && (
                            <button
                              className="opacity-0 group-hover/item:opacity-100 p-1 rounded-md bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all"
                              onClick={e => { e.stopPropagation(); handleDeleteCustom(sub.codigo, item.codigo); }}
                              title="Eliminar item propio"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Inline create form */}
                    {creatingIn?.subCode === sub.codigo && (
                      <div className="mt-1 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Plus size={10} className="text-emerald-400 shrink-0" />
                          <span className="text-[9px] text-emerald-400 font-bold uppercase">Nuevo item en {sub.codigo}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Descripcion..."
                          value={newItemDesc}
                          onChange={e => setNewItemDesc(e.target.value)}
                          className="w-full px-2 py-1.5 mb-1.5 text-[10px] rounded bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-emerald-500/50 placeholder-slate-600"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter' && newItemDesc.trim()) handleCreateCustom(); if (e.key === 'Escape') setCreatingIn(null); }}
                        />
                        <div className="flex gap-1.5 mb-2">
                          <select
                            value={newItemUnidad}
                            onChange={e => setNewItemUnidad(e.target.value)}
                            className="w-1/2 px-1.5 py-1.5 text-[10px] rounded bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                          >
                            <option value="">Unidad...</option>
                            {UNIDADES.map(u => (
                              <option key={u.value} value={u.value}>{u.value}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Precio RD$"
                            value={newItemPrecio}
                            onChange={e => setNewItemPrecio(e.target.value)}
                            className="w-1/2 px-2 py-1.5 text-[10px] rounded bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 font-mono-num text-right"
                            onKeyDown={e => { if (e.key === 'Enter' && newItemDesc.trim()) handleCreateCustom(); }}
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleCreateCustom}
                            disabled={!newItemDesc.trim()}
                            className="flex-1 px-2 py-1.5 text-[10px] font-semibold bg-emerald-500 text-white rounded hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Crear item
                          </button>
                          <button
                            onClick={() => { setCreatingIn(null); setNewItemDesc(''); setNewItemUnidad(''); setNewItemPrecio(''); }}
                            className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-white/5"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Add to presupuesto prompt */}
      {addingItem && (
        <div className="relative z-10 border-t border-slate-800 bg-slate-800/60 p-3">
          <div className="flex items-start gap-2 mb-2.5">
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
              addingItem.isCustom ? 'bg-emerald-500/15' : 'bg-cyan-500/15'
            }`}>
              <Plus size={10} className={addingItem.isCustom ? 'text-emerald-400' : 'text-cyan-400'} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-200 truncate">{addingItem.descripcion}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono-num text-slate-500">{addingItem.codigo}</span>
                <span className="text-[9px] text-slate-600">·</span>
                <span className="text-[9px] text-slate-500 uppercase">{addingItem.unidad}</span>
                <span className="text-[9px] text-slate-600">·</span>
                <span className="text-[9px] text-amber-500 font-mono-num font-semibold">RD$ {formatMoney(addingItem.precio)}</span>
                {addingItem.isCustom && (
                  <>
                    <span className="text-[9px] text-slate-600">·</span>
                    <span className="text-[7px] px-1 py-px rounded bg-emerald-500/15 text-emerald-400 font-bold">PROPIO</span>
                  </>
                )}
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
