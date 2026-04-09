import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  ConceptoPresupuesto, NaturalezaConcepto, OverridableField,
  BC3DragPayload, ComponentSource, PendingPropagation
} from '../types';
import { createMockPresupuesto, mockRootIds } from '../data/mockPresupuesto';
import { deepCloneSubtree } from '../utils/componentUtils';

const OVERRIDABLE_FIELDS: OverridableField[] = ['precioInterno', 'precioCliente', 'cantidad', 'descripcion', 'unidad'];

export function usePresupuesto() {
  const [conceptos, setConceptos] = useState<Record<string, ConceptoPresupuesto>>(createMockPresupuesto);
  const [rootIds, setRootIds] = useState<string[]>(mockRootIds);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [componentSources, setComponentSources] = useState<Record<string, ComponentSource>>({});
  const [pendingPropagation, setPendingPropagation] = useState<PendingPropagation | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // ── Tree expand/collapse ──

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandTo = useCallback((id: string) => {
    // Expand all ancestors of an item so it becomes visible
    setExpandedIds(prev => {
      const next = new Set(prev);
      let current = conceptos[id];
      while (current?.parentId) {
        next.add(current.parentId);
        current = conceptos[current.parentId];
      }
      return next;
    });
  }, [conceptos]);

  // Build flattened visible list by walking the tree
  const getVisibleIds = useCallback((): string[] => {
    const result: string[] = [];
    function walk(ids: string[]) {
      for (const id of ids) {
        const c = conceptos[id];
        if (!c) continue;
        result.push(id);
        if (c.childrenIds.length > 0 && expandedIds.has(id)) {
          walk(c.childrenIds);
        }
      }
    }
    walk(rootIds);
    return result;
  }, [rootIds, conceptos, expandedIds]);

  // ── Totals ──

  const getTotal = useCallback((id: string): number => {
    const c = conceptos[id];
    if (!c) return 0;
    if (c.childrenIds.length > 0) {
      return c.childrenIds.reduce((sum, childId) => sum + getTotal(childId), 0);
    }
    return c.cantidad * c.precioCliente;
  }, [conceptos]);

  const getTotalInterno = useCallback((id: string): number => {
    const c = conceptos[id];
    if (!c) return 0;
    if (c.childrenIds.length > 0) {
      return c.childrenIds.reduce((sum, childId) => sum + getTotalInterno(childId), 0);
    }
    return c.cantidad * c.precioInterno;
  }, [conceptos]);

  const getGrandTotal = useCallback((): number => {
    return rootIds.reduce((sum, id) => sum + getTotal(id), 0);
  }, [rootIds, getTotal]);

  const getGrandTotalInterno = useCallback((): number => {
    return rootIds.reduce((sum, id) => sum + getTotalInterno(id), 0);
  }, [rootIds, getTotalInterno]);

  // ── Update with override tracking ──

  const updateConcepto = useCallback((id: string, updates: Partial<ConceptoPresupuesto>) => {
    setConceptos(prev => {
      const c = prev[id];
      if (!c) return prev;

      const newOverrides = { ...(c.overrides ?? {}) };

      for (const field of OVERRIDABLE_FIELDS) {
        if (!(field in updates)) continue;
        const newVal = updates[field as keyof ConceptoPresupuesto];
        const curVal = c[field as keyof ConceptoPresupuesto];
        if (newVal === curVal) continue;

        // Determine original value
        let originalVal: number | string | undefined;
        if (field in newOverrides) {
          // Already overridden — keep the stored original
          originalVal = newOverrides[field];
        } else if (c.componentSourceId && prev[c.componentSourceId]) {
          // Component instance — original comes from source
          originalVal = prev[c.componentSourceId][field as keyof ConceptoPresupuesto] as number | string;
        } else {
          // Standalone — original is the current value before edit
          originalVal = curVal as number | string;
        }

        // Store original if not already tracked
        if (!(field in newOverrides)) {
          newOverrides[field] = originalVal;
        }

        // If reverting to original, clear override
        if (newVal === newOverrides[field]) {
          delete newOverrides[field];
        }
      }

      const hasOverrides = Object.keys(newOverrides).length > 0;
      const updated = { ...c, ...updates, overrides: hasOverrides ? newOverrides : undefined };

      // Trigger propagation dialog if this is a component source
      if (c.isComponentSource) {
        const changedFields = OVERRIDABLE_FIELDS.filter(f => f in updates && updates[f as keyof ConceptoPresupuesto] !== c[f as keyof ConceptoPresupuesto]);
        if (changedFields.length > 0) {
          setPendingPropagation({ sourceId: id, changedFields });
        }
      }

      return { ...prev, [id]: updated };
    });
  }, []);

  // ── Revert override ──

  const revertOverride = useCallback((id: string, field: OverridableField) => {
    setConceptos(prev => {
      const c = prev[id];
      if (!c?.overrides?.[field] === undefined) return prev;

      const originalValue = c.overrides![field];
      const newOverrides = { ...c.overrides };
      delete newOverrides[field];

      return {
        ...prev,
        [id]: {
          ...c,
          [field]: originalValue,
          overrides: Object.keys(newOverrides).length > 0 ? newOverrides : undefined,
        },
      };
    });
  }, []);

  // ── Add basic row ──

  const addConcepto = useCallback((parentId: string | null | undefined, tipo: NaturalezaConcepto = 'Partida', afterId?: string): string => {
    const newId = uuidv4();
    const parent = parentId ? conceptos[parentId] : null;
    const nivel = parent ? parent.nivel + 1 : 0;
    const siblings = parentId ? (conceptos[parentId]?.childrenIds ?? []) : rootIds;

    let insertIdx = siblings.length;
    if (afterId) {
      const idx = siblings.indexOf(afterId);
      if (idx >= 0) insertIdx = idx + 1;
    }

    const newConcepto: ConceptoPresupuesto = {
      id: newId, codigo: '', descripcion: '', tipo, unidad: '',
      cantidad: 0, precioRef: 0, precioInterno: 0, precioCliente: 0,
      parentId, childrenIds: [], nivel, orden: insertIdx,
    };

    setConceptos(prev => {
      const next = { ...prev, [newId]: newConcepto };
      if (parentId && next[parentId]) {
        const newChildren = [...next[parentId].childrenIds];
        newChildren.splice(insertIdx, 0, newId);
        next[parentId] = { ...next[parentId], childrenIds: newChildren };
      }
      return next;
    });

    if (!parentId) {
      setRootIds(prev => {
        const next = [...prev];
        next.splice(insertIdx, 0, newId);
        return next;
      });
    }
    return newId;
  }, [conceptos, rootIds]);

  // ── Add from BC3 (simple click) ──

  const addFromBC3 = useCallback((item: { codigo: string; descripcion: string; unidad: string; precio: number }, cantidad: number) => {
    // If a Capitulo is selected, insert inside it; else use root
    let targetParentId: string | null = null;
    if (selectedIds.size === 1) {
      const selId = Array.from(selectedIds)[0];
      const sel = conceptos[selId];
      if (sel?.tipo === 'Capitulo') {
        targetParentId = selId;
      }
    }

    const newId = uuidv4();
    const parent = targetParentId ? conceptos[targetParentId] : null;
    const nivel = parent ? parent.nivel + 1 : 0;

    const newConcepto: ConceptoPresupuesto = {
      id: newId, codigo: item.codigo, descripcion: item.descripcion,
      tipo: 'Partida', unidad: item.unidad, cantidad,
      precioRef: item.precio, precioInterno: item.precio, precioCliente: item.precio,
      parentId: targetParentId, childrenIds: [], nivel,
      orden: 0, codigoBC3: item.codigo,
    };

    setConceptos(prev => {
      const next = { ...prev, [newId]: newConcepto };
      if (targetParentId && next[targetParentId]) {
        next[targetParentId] = { ...next[targetParentId], childrenIds: [...next[targetParentId].childrenIds, newId] };
      }
      return next;
    });

    if (!targetParentId) {
      setRootIds(prev => [...prev, newId]);
    }
  }, [conceptos, rootIds, selectedIds]);

  // ── Drag & Drop: add with target + auto-folder ──

  const ensureCategoryFolder = useCallback((
    prev: Record<string, ConceptoPresupuesto>,
    parentId: string | null,
    catCode: string,
    catName: string,
    currentRootIds: string[],
  ): { next: Record<string, ConceptoPresupuesto>; folderId: string; newRootIds: string[] | null } => {
    const siblings = parentId ? (prev[parentId]?.childrenIds ?? []) : currentRootIds;

    // Check if folder already exists
    const existing = siblings.find(sid => prev[sid]?.codigo === catCode);
    if (existing) return { next: prev, folderId: existing, newRootIds: null };

    // Create new folder
    const folderId = uuidv4();
    const parent = parentId ? prev[parentId] : null;
    const nivel = parent ? parent.nivel + 1 : 0;

    const folder: ConceptoPresupuesto = {
      id: folderId, codigo: catCode, descripcion: catName,
      tipo: 'Capitulo', unidad: '', cantidad: 0,
      precioRef: 0, precioInterno: 0, precioCliente: 0,
      parentId, childrenIds: [], nivel, orden: siblings.length,
    };

    const next = { ...prev, [folderId]: folder };
    let newRootIds: string[] | null = null;

    if (parentId && next[parentId]) {
      next[parentId] = { ...next[parentId], childrenIds: [...next[parentId].childrenIds, folderId] };
    } else {
      newRootIds = [...currentRootIds, folderId];
    }

    return { next, folderId, newRootIds };
  }, []);

  const addFromBC3WithTarget = useCallback((payload: BC3DragPayload, targetId: string | null, cantidad: number) => {
    setConceptos(prev => {
      let next = { ...prev };
      let parentId: string | null;

      if (targetId && next[targetId]?.tipo === 'Capitulo') {
        parentId = targetId;
      } else {
        parentId = null;
      }

      // Auto-create category folder
      let updatedRootIds: string[] | null = null;
      const { next: afterFolder, folderId, newRootIds } = ensureCategoryFolder(
        next, parentId, payload.subCategoryCode, payload.subCategoryName, rootIds
      );
      next = afterFolder;
      if (newRootIds) updatedRootIds = newRootIds;
      parentId = folderId;

      // Create the item inside the folder
      const newId = uuidv4();
      const folderConcepto = next[parentId];
      const nivel = folderConcepto ? folderConcepto.nivel + 1 : 0;

      next[newId] = {
        id: newId, codigo: payload.item.codigo, descripcion: payload.item.descripcion,
        tipo: 'Partida', unidad: payload.item.unidad, cantidad,
        precioRef: payload.item.precio, precioInterno: payload.item.precio, precioCliente: payload.item.precio,
        parentId, childrenIds: [], nivel,
        orden: folderConcepto?.childrenIds.length ?? 0, codigoBC3: payload.item.codigo,
      };

      // Add to folder's children
      if (next[parentId]) {
        next[parentId] = { ...next[parentId], childrenIds: [...next[parentId].childrenIds, newId] };
      }

      if (updatedRootIds) {
        setRootIds(updatedRootIds);
      }

      // Auto-expand the entire path so the new item is visible
      setExpandedIds(prev => {
        const expanded = new Set(prev);
        // Expand the target (if it was a Capitulo)
        if (targetId) expanded.add(targetId);
        // Expand the auto-created folder
        expanded.add(parentId!);
        // Expand all ancestors up to root
        let cur = next[parentId!];
        while (cur?.parentId) {
          expanded.add(cur.parentId);
          cur = next[cur.parentId];
        }
        return expanded;
      });

      return next;
    });
  }, [rootIds, ensureCategoryFolder]);

  // ── Delete ──

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;

    setConceptos(prev => {
      const next = { ...prev };
      const idsToDelete = new Set<string>();

      function collectDescendants(id: string) {
        idsToDelete.add(id);
        next[id]?.childrenIds.forEach(collectDescendants);
      }
      selectedIds.forEach(id => collectDescendants(id));

      // If deleting a component source, unlink instances
      selectedIds.forEach(id => {
        const c = next[id];
        if (c?.isComponentSource) {
          const source = componentSources[id];
          if (source) {
            source.instanceIds.forEach(instId => {
              if (next[instId]) {
                next[instId] = { ...next[instId], componentSourceId: undefined };
              }
            });
          }
        }
      });

      // Remove from parents
      selectedIds.forEach(id => {
        const c = next[id];
        if (c?.parentId && next[c.parentId]) {
          next[c.parentId] = {
            ...next[c.parentId],
            childrenIds: next[c.parentId].childrenIds.filter(cid => !idsToDelete.has(cid)),
          };
        }
      });

      idsToDelete.forEach(id => {
        // Clean component source registry
        if (next[id]?.componentSourceId) {
          setComponentSources(prev => {
            const srcId = next[id].componentSourceId!;
            if (!prev[srcId]) return prev;
            const updated = new Set(prev[srcId].instanceIds);
            updated.delete(id);
            if (updated.size === 0) {
              const { [srcId]: _, ...rest } = prev;
              return rest;
            }
            return { ...prev, [srcId]: { ...prev[srcId], instanceIds: updated } };
          });
        }
        delete next[id];
      });
      return next;
    });

    setRootIds(prev => prev.filter(id => !selectedIds.has(id)));
    setSelectedIds(new Set());
  }, [selectedIds, componentSources]);

  // ── Move up/down ──

  const moveSelected = useCallback((direction: 'up' | 'down') => {
    if (selectedIds.size !== 1) return;
    const id = Array.from(selectedIds)[0];
    const c = conceptos[id];
    if (!c) return;

    const updateSiblings = (siblings: string[]): string[] => {
      const idx = siblings.indexOf(id);
      if (idx < 0) return siblings;
      if (direction === 'up' && idx === 0) return siblings;
      if (direction === 'down' && idx === siblings.length - 1) return siblings;
      const newSiblings = [...siblings];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newSiblings[idx], newSiblings[swapIdx]] = [newSiblings[swapIdx], newSiblings[idx]];
      return newSiblings;
    };

    if (c.parentId) {
      setConceptos(prev => ({
        ...prev,
        [c.parentId!]: { ...prev[c.parentId!], childrenIds: updateSiblings(prev[c.parentId!].childrenIds) },
      }));
    } else {
      setRootIds(prev => updateSiblings(prev));
    }
  }, [selectedIds, conceptos]);

  // ── Indent / Outdent ──

  const indentSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const sortedSelected = Array.from(selectedIds);
    const first = conceptos[sortedSelected[0]];
    if (!first) return;

    const siblings = first.parentId ? conceptos[first.parentId]?.childrenIds ?? [] : rootIds;
    const firstIdx = siblings.indexOf(sortedSelected[0]);
    if (firstIdx <= 0) return;

    const newParentId = siblings[firstIdx - 1];
    if (!conceptos[newParentId]) return;

    setConceptos(prev => {
      const next = { ...prev };
      if (first.parentId && next[first.parentId]) {
        next[first.parentId] = {
          ...next[first.parentId],
          childrenIds: next[first.parentId].childrenIds.filter(id => !selectedIds.has(id)),
        };
      }
      next[newParentId] = {
        ...next[newParentId],
        childrenIds: [...next[newParentId].childrenIds, ...sortedSelected],
        tipo: 'Capitulo',
      };
      sortedSelected.forEach(id => {
        next[id] = { ...next[id], parentId: newParentId, nivel: next[newParentId].nivel + 1 };
      });
      return next;
    });

    if (!first.parentId) {
      setRootIds(prev => prev.filter(id => !selectedIds.has(id)));
    }
  }, [selectedIds, conceptos, rootIds]);

  const outdentSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const sortedSelected = Array.from(selectedIds);
    const first = conceptos[sortedSelected[0]];
    if (!first || !first.parentId) return;

    const oldParent = conceptos[first.parentId];
    if (!oldParent) return;
    const grandparentId = oldParent.parentId;

    setConceptos(prev => {
      const next = { ...prev };
      next[first.parentId!] = {
        ...next[first.parentId!],
        childrenIds: next[first.parentId!].childrenIds.filter(id => !selectedIds.has(id)),
      };
      if (grandparentId && next[grandparentId]) {
        const gpChildren = next[grandparentId].childrenIds;
        const parentIdx = gpChildren.indexOf(first.parentId!);
        const newChildren = [...gpChildren];
        newChildren.splice(parentIdx + 1, 0, ...sortedSelected);
        next[grandparentId] = { ...next[grandparentId], childrenIds: newChildren };
      }
      sortedSelected.forEach(id => {
        next[id] = { ...next[id], parentId: grandparentId, nivel: oldParent.nivel };
      });
      return next;
    });

    if (!grandparentId) {
      setRootIds(prev => {
        const parentIdx = prev.indexOf(first.parentId!);
        const newRoots = [...prev];
        newRoots.splice(parentIdx + 1, 0, ...sortedSelected);
        return newRoots;
      });
    }
  }, [selectedIds, conceptos, rootIds]);

  // ── Paste from Excel ──

  const pasteFromClipboard = useCallback((rows: string[][]) => {
    // Paste into selected Capitulo, or root
    let parentId: string | null = null;
    if (selectedIds.size === 1) {
      const selId = Array.from(selectedIds)[0];
      if (conceptos[selId]?.tipo === 'Capitulo') parentId = selId;
    }
    const parent = parentId ? conceptos[parentId] : null;
    const nivel = parent ? parent.nivel + 1 : 0;
    const newIds: string[] = [];

    setConceptos(prev => {
      const next = { ...prev };
      rows.forEach(cols => {
        const newId = uuidv4();
        newIds.push(newId);
        next[newId] = {
          id: newId, codigo: cols[0]?.trim() ?? '',
          descripcion: cols[1]?.trim() ?? cols[0]?.trim() ?? '',
          tipo: 'Partida', unidad: cols[2]?.trim() ?? '',
          cantidad: parseFloat(cols[3]?.replace(/,/g, '') ?? '0') || 0,
          precioRef: 0,
          precioInterno: parseFloat(cols[4]?.replace(/,/g, '') ?? '0') || 0,
          precioCliente: parseFloat(cols[4]?.replace(/,/g, '') ?? '0') || 0,
          parentId, childrenIds: [], nivel, orden: 0,
        };
        if (parentId && next[parentId]) {
          next[parentId] = { ...next[parentId], childrenIds: [...next[parentId].childrenIds, newId] };
        }
      });
      return next;
    });

    if (!parentId) setRootIds(prev => [...prev, ...newIds]);
  }, [conceptos, selectedIds]);

  // ── Change tipo ──

  const changeTipoSelected = useCallback((tipo: NaturalezaConcepto) => {
    setConceptos(prev => {
      const next = { ...prev };
      selectedIds.forEach(id => {
        if (next[id]) next[id] = { ...next[id], tipo };
      });
      return next;
    });
  }, [selectedIds]);

  // ── Component system ──

  const copyAsComponent = useCallback((targetParentId: string | null) => {
    if (selectedIds.size === 0) return;
    const sourceId = Array.from(selectedIds)[0]; // Use first selected as source

    setConceptos(prev => {
      let next = { ...prev };
      const source = next[sourceId];
      if (!source) return prev;

      // Mark source
      next[sourceId] = { ...source, isComponentSource: true };

      // Clone subtree
      const parent = targetParentId ? next[targetParentId] : null;
      const nivel = parent ? parent.nivel + 1 : 0;
      const { cloned, newRootId, idMap } = deepCloneSubtree(next, sourceId, targetParentId, nivel, true);

      // Merge cloned into state
      next = { ...next, ...cloned };

      // Add to target parent
      if (targetParentId && next[targetParentId]) {
        next[targetParentId] = {
          ...next[targetParentId],
          childrenIds: [...next[targetParentId].childrenIds, newRootId],
        };
      }

      // Register component source
      const instanceIds = new Set<string>();
      // Collect all instance IDs (the cloned root + all descendants)
      Object.keys(cloned).forEach(id => {
        const origId = Object.entries(idMap).find(([_, v]) => v === id)?.[0];
        if (origId) instanceIds.add(id);
      });

      setComponentSources(prevSources => ({
        ...prevSources,
        [sourceId]: {
          sourceId,
          instanceIds: new Set([...(prevSources[sourceId]?.instanceIds ?? []), newRootId]),
        },
      }));

      if (!targetParentId) {
        setRootIds(prevRoots => [...prevRoots, newRootId]);
      }

      return next;
    });
  }, [selectedIds]);

  const copyAsIndependent = useCallback((targetParentId: string | null) => {
    if (selectedIds.size === 0) return;
    const sourceId = Array.from(selectedIds)[0];

    setConceptos(prev => {
      const source = prev[sourceId];
      if (!source) return prev;

      const parent = targetParentId ? prev[targetParentId] : null;
      const nivel = parent ? parent.nivel + 1 : 0;
      const { cloned, newRootId } = deepCloneSubtree(prev, sourceId, targetParentId, nivel, false);

      const next = { ...prev, ...cloned };

      if (targetParentId && next[targetParentId]) {
        next[targetParentId] = {
          ...next[targetParentId],
          childrenIds: [...next[targetParentId].childrenIds, newRootId],
        };
      }

      if (!targetParentId) {
        setRootIds(prevRoots => [...prevRoots, newRootId]);
      }

      return next;
    });
  }, [selectedIds]);

  const propagateComponentChange = useCallback((
    sourceId: string,
    changedFields: OverridableField[],
    mode: 'all' | 'non-overridden' | 'skip'
  ) => {
    if (mode === 'skip') {
      setPendingPropagation(null);
      return;
    }

    const source = componentSources[sourceId];
    if (!source) {
      setPendingPropagation(null);
      return;
    }

    setConceptos(prev => {
      const next = { ...prev };
      const sourceConcepto = next[sourceId];
      if (!sourceConcepto) return prev;

      for (const instanceId of source.instanceIds) {
        const instance = next[instanceId];
        if (!instance) continue;

        for (const field of changedFields) {
          const isOverridden = instance.overrides?.[field] !== undefined;

          if (mode === 'all') {
            const newOverrides = { ...(instance.overrides ?? {}) };
            delete newOverrides[field];
            next[instanceId] = {
              ...instance,
              [field]: sourceConcepto[field as keyof ConceptoPresupuesto],
              overrides: Object.keys(newOverrides).length > 0 ? newOverrides : undefined,
            };
          } else if (mode === 'non-overridden' && !isOverridden) {
            next[instanceId] = {
              ...instance,
              [field]: sourceConcepto[field as keyof ConceptoPresupuesto],
            };
          }
        }
      }
      return next;
    });

    setPendingPropagation(null);
  }, [componentSources]);

  // ── Helpers ──

  const getSelectedCapituloId = useCallback((): string | null => {
    if (selectedIds.size !== 1) return null;
    const id = Array.from(selectedIds)[0];
    return conceptos[id]?.tipo === 'Capitulo' ? id : null;
  }, [selectedIds, conceptos]);

  return {
    conceptos, rootIds,
    selectedIds, setSelectedIds,
    expandedIds, toggleExpanded,
    componentSources, pendingPropagation, setPendingPropagation,
    dropTargetId, setDropTargetId,
    getVisibleIds,
    getTotal, getTotalInterno, getGrandTotal, getGrandTotalInterno,
    updateConcepto, revertOverride,
    addConcepto, addFromBC3, addFromBC3WithTarget,
    deleteSelected, moveSelected, indentSelected, outdentSelected,
    pasteFromClipboard, changeTipoSelected,
    copyAsComponent, copyAsIndependent, propagateComponentChange,
    getSelectedCapituloId,
  };
}
