import { useState } from 'react';
import type { ConceptoPresupuesto } from '../types';
import { Building2, Layers, Plus, X, ChevronRight } from 'lucide-react';

interface Props {
  conceptos: Record<string, ConceptoPresupuesto>;
  rootIds: string[];
  onAddBloque: (nombre: string, codigo: string) => void;
  onAddNivel: (bloqueId: string, nombre: string, numero: number) => void;
  onClose: () => void;
}

export function AddBloqueNivelModal({ conceptos, rootIds, onAddBloque, onAddNivel, onClose }: Props) {
  const [mode, setMode] = useState<'select' | 'newBloque' | 'newNivel'>('select');
  const [selectedBloqueId, setSelectedBloqueId] = useState<string | null>(null);

  const [newBloqueNombre, setNewBloqueNombre] = useState('');
  const [newBloqueCodigo, setNewBloqueCodigo] = useState('');

  const [newNivelNumero, setNewNivelNumero] = useState('');
  const [newNivelNombre, setNewNivelNombre] = useState('');

  // Root concepts are "bloques", their direct children are "niveles"
  const bloques = rootIds.map(id => conceptos[id]).filter(Boolean);

  const handleCreateBloque = () => {
    if (!newBloqueNombre.trim()) return;
    const codigo = newBloqueCodigo.trim().toUpperCase() || String.fromCharCode(65 + bloques.length);
    onAddBloque(newBloqueNombre.trim(), codigo);
    setMode('select');
    setNewBloqueNombre('');
    setNewBloqueCodigo('');
  };

  const handleCreateNivel = () => {
    if (!selectedBloqueId || !newNivelNombre.trim()) return;
    const numero = parseInt(newNivelNumero) || 0;
    onAddNivel(selectedBloqueId, newNivelNombre.trim(), numero);
    setMode('select');
    setNewNivelNumero('');
    setNewNivelNombre('');
  };

  const selectedBloque = selectedBloqueId ? conceptos[selectedBloqueId] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[460px] max-h-[80vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {mode === 'select' ? 'Bloques y Niveles' : mode === 'newBloque' ? 'Nuevo Bloque' : 'Nuevo Nivel'}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {mode === 'select'
                  ? 'Gestiona la estructura del proyecto'
                  : mode === 'newBloque'
                    ? 'Crea un nuevo bloque del proyecto'
                    : `Agregar nivel a ${selectedBloque?.descripcion ?? ''}`
                }
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 flex-1 overflow-y-auto">

          {mode === 'select' && (
            <div className="space-y-2">
              {bloques.map(bloque => {
                const niveles = bloque.childrenIds.map(id => conceptos[id]).filter(Boolean);
                return (
                  <div key={bloque.id} className="rounded-xl border border-slate-200 overflow-hidden">
                    <div
                      className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${
                        selectedBloqueId === bloque.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedBloqueId(selectedBloqueId === bloque.id ? null : bloque.id)}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-white font-mono-num">{bloque.codigo.replace('BLQ-', '')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-slate-800 truncate">{bloque.descripcion}</div>
                        <div className="text-[10px] text-slate-400">{niveles.length} niveles</div>
                      </div>
                      <ChevronRight size={14} className={`text-slate-300 transition-transform ${selectedBloqueId === bloque.id ? 'rotate-90' : ''}`} />
                    </div>

                    {selectedBloqueId === bloque.id && (
                      <div className="border-t border-slate-100 bg-slate-50/50">
                        {niveles.map(nivel => (
                          <div
                            key={nivel.id}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-blue-50/50 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold font-mono-num">{nivel.codigo}</span>
                            </div>
                            <span className="text-[11px] text-slate-700 font-medium">{nivel.descripcion}</span>
                          </div>
                        ))}

                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-emerald-600 hover:bg-emerald-50 transition-colors border-t border-slate-100"
                          onClick={() => { setSelectedBloqueId(bloque.id); setMode('newNivel'); }}
                        >
                          <Plus size={12} />
                          <span className="text-[11px] font-semibold">Agregar nivel</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                onClick={() => setMode('newBloque')}
              >
                <Plus size={14} />
                <span className="text-[12px] font-semibold">Nuevo bloque</span>
              </button>
            </div>
          )}

          {mode === 'newBloque' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Nombre del bloque</label>
                <input
                  type="text"
                  placeholder="Ej: Torre Norte, Bloque B..."
                  value={newBloqueNombre}
                  onChange={e => setNewBloqueNombre(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateBloque(); if (e.key === 'Escape') setMode('select'); }}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Codigo (opcional)</label>
                <input
                  type="text"
                  placeholder="A, B, C..."
                  value={newBloqueCodigo}
                  onChange={e => setNewBloqueCodigo(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 uppercase font-mono-num"
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateBloque(); }}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleCreateBloque} disabled={!newBloqueNombre.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Building2 size={14} /> Crear bloque
                </button>
                <button onClick={() => { setMode('select'); setNewBloqueNombre(''); setNewBloqueCodigo(''); }} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {mode === 'newNivel' && selectedBloque && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white font-mono-num">{selectedBloque.codigo.replace('BLQ-', '')}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-700">{selectedBloque.descripcion}</span>
              </div>
              <div className="flex gap-3">
                <div className="w-1/3">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Numero</label>
                  <input
                    type="number"
                    placeholder="-1, 0, 1..."
                    value={newNivelNumero}
                    onChange={e => setNewNivelNumero(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 font-mono-num text-center"
                    autoFocus
                  />
                </div>
                <div className="w-2/3">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: Sotano 1, Nivel 3, Azotea..."
                    value={newNivelNombre}
                    onChange={e => setNewNivelNombre(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
                    onKeyDown={e => { if (e.key === 'Enter') handleCreateNivel(); }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleCreateNivel} disabled={!newNivelNombre.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Layers size={14} /> Crear nivel
                </button>
                <button onClick={() => { setMode('select'); setNewNivelNumero(''); setNewNivelNombre(''); }} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 shrink-0">
          <p className="text-[9px] text-slate-400 flex items-center gap-1.5">
            <Layers size={10} />
            En BIMCORD los bloques se importan desde la factibilidad del proyecto
          </p>
        </div>
      </div>
    </div>
  );
}
