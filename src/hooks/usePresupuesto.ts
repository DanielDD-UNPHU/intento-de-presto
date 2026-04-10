import { useState, useCallback, useRef, useEffect } from 'react';
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

  // Refs to always read fresh state (avoids stale closure in drop handlers)
  const conceptosRef = useRef(conceptos);
  const rootIdsRef = useRef(rootIds);
  useEffect(() => { conceptosRef.current = conceptos; }, [conceptos]);
  useEffect(() => { rootIdsRef.current = rootIds; }, [rootIds]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [componentSources, setComponentSources] = useState<Record<string, ComponentSource>>({});
  const [pendingPropagation, setPendingPropagation] = useState<PendingPropagation | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [bc3DragPayload, setBC3DragPayload] = useState<BC3DragPayload | null>(null);


  // ── Tree expand/collapse ──

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandId = useCallback((id: string) => {
    setExpandedIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
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

  // Direct update without override tracking (for initial setup of new concepts)
  const setConceptoDirectly = useCallback((id: string, updates: Partial<ConceptoPresupuesto>) => {
    setConceptos(prev => {
      const c = prev[id];
      if (!c) return prev;
      return { ...prev, [id]: { ...c, ...updates } };
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


  const addFromBC3WithTarget = useCallback((payload: BC3DragPayload, targetId: string | null, cantidad: number) => {
    const snap = conceptosRef.current;
    const currentRoots = rootIdsRef.current;

    let next = { ...snap };
    let nextRootIds = [...currentRoots];

    let parentId: string | null = null;
    if (targetId && next[targetId]?.tipo === 'Capitulo') {
      parentId = targetId;
    }

    // Helper: find or create a folder under a parent
    function ensureFolder(
      under: string | null,
      code: string,
      name: string
    ): string {
      const siblings = under ? (next[under]?.childrenIds ?? []) : nextRootIds;
      const existing = siblings.find(sid => next[sid]?.codigo === code);
      if (existing) return existing;

      const id = uuidv4();
      const parent = under ? next[under] : null;
      const nivel = parent ? parent.nivel + 1 : 0;
      next[id] = {
        id, codigo: code, descripcion: name,
        tipo: 'Capitulo' as const, unidad: '', cantidad: 0,
        precioRef: 0, precioInterno: 0, precioCliente: 0,
        parentId: under, childrenIds: [], nivel, orden: siblings.length,
      };
      if (under && next[under]) {
        next[under] = { ...next[under], childrenIds: [...next[under].childrenIds, id] };
      } else {
        nextRootIds.push(id);
      }
      return id;
    }

    // Create folder chain: subCategory (A04# HORMIGON) > subSubCategory (A0402# COLUMNAS)
    const subFolderId = ensureFolder(parentId, payload.subCategoryCode, payload.subCategoryName);
    const subSubFolderId = ensureFolder(subFolderId, payload.subSubCategoryCode, payload.subSubCategoryName);

    // Create the item inside the sub-sub folder
    const newId = uuidv4();
    const folderConcepto = next[subSubFolderId];
    const itemNivel = folderConcepto ? folderConcepto.nivel + 1 : 0;

    next[newId] = {
      id: newId, codigo: payload.item.codigo, descripcion: payload.item.descripcion,
      tipo: 'Partida', unidad: payload.item.unidad, cantidad,
      precioRef: payload.item.precio, precioInterno: payload.item.precio, precioCliente: payload.item.precio,
      parentId: subSubFolderId, childrenIds: [], nivel: itemNivel,
      orden: folderConcepto?.childrenIds.length ?? 0, codigoBC3: payload.item.codigo,
    };
    next[subSubFolderId] = { ...next[subSubFolderId], childrenIds: [...next[subSubFolderId].childrenIds, newId] };

    setConceptos(next);
    setRootIds(nextRootIds);

    // Auto-expand the entire path
    setExpandedIds(prev => {
      const expanded = new Set(prev);
      if (targetId) expanded.add(targetId);
      expanded.add(subFolderId);
      expanded.add(subSubFolderId);
      let cur = next[subFolderId];
      while (cur?.parentId) {
        expanded.add(cur.parentId);
        cur = next[cur.parentId];
      }
      return expanded;
    });
  }, []);

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

  // ── Move concepto via drag & drop ──

  const moveConceptoTo = useCallback((dragId: string, targetId: string | null, position: 'inside' | 'before' | 'after') => {
    if (dragId === targetId) return;
    if (!targetId) return;

    setConceptos(prev => {
      const next = { ...prev };
      const dragged = next[dragId];
      if (!dragged) return prev;

      // Get the ancestor chain of the dragged item (excluding itself)
      // e.g. for "Fino de techo": [TERMINACION DE TECHOS, OBRA GRUESA, BLOQUE A, AZOTEA]
      function getAncestorChain(id: string): ConceptoPresupuesto[] {
        const chain: ConceptoPresupuesto[] = [];
        let cur = next[id];
        while (cur?.parentId) {
          cur = next[cur.parentId];
          if (cur) chain.push(cur);
        }
        return chain; // from immediate parent → root
      }

      // Find the destination Capitulo where the item should land
      let destParentId: string;
      if (position === 'inside') {
        destParentId = targetId;
      } else {
        // before/after: destination is the target's parent
        const target = next[targetId];
        if (!target?.parentId) return prev; // can't reorder at root level for items
        destParentId = target.parentId;
      }

      // Get only the BC3 category ancestors (those with # in codigo)
      // e.g. for "Ceramica europea": [A0901# PISOS, A09# PISOS]
      const dragParentChain = getAncestorChain(dragId);
      const bc3Caps = dragParentChain.filter(c =>
        c.tipo === 'Capitulo' && c.codigo.endsWith('#')
      );

      // Ensure BC3 folder chain exists at destination, matching by CODIGO
      function ensureBC3Chain(parentId: string): string {
        // bc3Caps is [immediate parent, grandparent, ...] — reverse to create top-down
        const toCreate = [...bc3Caps].reverse();
        let currentParent = parentId;

        for (const cap of toCreate) {
          const existingChildren = next[currentParent]?.childrenIds ?? [];
          const existing = existingChildren.find(
            cid => next[cid]?.codigo === cap.codigo
          );

          if (existing) {
            currentParent = existing;
          } else {
            const newCapId = uuidv4();
            const parentConcepto = next[currentParent];
            const nivel = parentConcepto ? parentConcepto.nivel + 1 : 0;
            next[newCapId] = {
              id: newCapId, codigo: cap.codigo, descripcion: cap.descripcion,
              tipo: 'Capitulo', unidad: '', cantidad: 0,
              precioRef: 0, precioInterno: 0, precioCliente: 0,
              parentId: currentParent, childrenIds: [], nivel, orden: existingChildren.length,
            };
            next[currentParent] = {
              ...next[currentParent],
              childrenIds: [...next[currentParent].childrenIds, newCapId],
            };
            currentParent = newCapId;
          }
        }

        return currentParent;
      }

      // Only ensure chain if dropping into a different parent than current
      const sameParent = position === 'inside'
        ? dragged.parentId === targetId
        : dragged.parentId === next[targetId]?.parentId;

      let finalParentId: string;

      if (sameParent) {
        // Simple reorder within same parent
        finalParentId = position === 'inside' ? targetId : next[targetId]!.parentId!;
      } else {
        // Moving to different location — ensure ancestor chain
        finalParentId = ensureBC3Chain(destParentId);
      }

      // 1. Remove from old parent
      const oldParentId = dragged.parentId;
      if (oldParentId && next[oldParentId]) {
        next[oldParentId] = {
          ...next[oldParentId],
          childrenIds: next[oldParentId].childrenIds.filter(id => id !== dragId),
        };
      }
      let newRoots: string[] | null = oldParentId ? null : rootIds.filter(id => id !== dragId);

      // 2. Insert
      if (sameParent && (position === 'before' || position === 'after')) {
        // Simple reorder
        const siblings = [...(next[finalParentId]?.childrenIds ?? [])];
        const targetIdx = siblings.indexOf(targetId);
        const offset = position === 'before' ? 0 : 1;
        siblings.splice(targetIdx + offset, 0, dragId);
        next[finalParentId] = { ...next[finalParentId], childrenIds: siblings };
        next[dragId] = { ...dragged, parentId: finalParentId, nivel: next[finalParentId].nivel + 1 };
      } else {
        // Add to the end of the final parent
        next[finalParentId] = {
          ...next[finalParentId],
          childrenIds: [...next[finalParentId].childrenIds, dragId],
        };
        next[dragId] = { ...dragged, parentId: finalParentId, nivel: next[finalParentId].nivel + 1 };
      }

      // Update children nivels recursively
      function updateNivels(id: string, nivel: number) {
        const c = next[id];
        if (!c) return;
        if (c.nivel !== nivel) next[id] = { ...c, nivel };
        c.childrenIds.forEach(childId => updateNivels(childId, nivel + 1));
      }
      updateNivels(dragId, next[dragId].nivel);

      if (newRoots) setRootIds(newRoots);

      // Auto-expand the path
      setExpandedIds(prev => {
        const expanded = new Set(prev);
        expanded.add(finalParentId);
        let cur = next[finalParentId];
        while (cur?.parentId) {
          expanded.add(cur.parentId);
          cur = next[cur.parentId];
        }
        return expanded;
      });

      return next;
    });
  }, [rootIds]);

  // ── Helpers ──

  // Delete a single concepto and all its descendants
  const deleteConcepto = useCallback((id: string) => {
    setConceptos(prev => {
      const next = { ...prev };
      const idsToDelete = new Set<string>();

      function collect(cid: string) {
        idsToDelete.add(cid);
        next[cid]?.childrenIds.forEach(collect);
      }
      collect(id);

      // Remove from parent
      const c = next[id];
      if (c?.parentId && next[c.parentId]) {
        next[c.parentId] = {
          ...next[c.parentId],
          childrenIds: next[c.parentId].childrenIds.filter(cid => cid !== id),
        };
      }

      idsToDelete.forEach(cid => delete next[cid]);
      return next;
    });

    setRootIds(prev => prev.filter(rid => rid !== id));
    setSelectedIds(new Set());
  }, []);

  const getSelectedCapituloId = useCallback((): string | null => {
    if (selectedIds.size !== 1) return null;
    const id = Array.from(selectedIds)[0];
    return conceptos[id]?.tipo === 'Capitulo' ? id : null;
  }, [selectedIds, conceptos]);

  return {
    conceptos, rootIds,
    selectedIds, setSelectedIds,
    expandedIds, toggleExpanded, expandId,
    componentSources, pendingPropagation, setPendingPropagation,
    dropTargetId, setDropTargetId, dropPosition, setDropPosition, bc3DragPayload, setBC3DragPayload,
    getVisibleIds,
    getTotal, getTotalInterno, getGrandTotal, getGrandTotalInterno,
    updateConcepto, setConceptoDirectly, revertOverride,
    addConcepto, addFromBC3, addFromBC3WithTarget,
    deleteSelected, moveSelected, indentSelected, outdentSelected,
    pasteFromClipboard, changeTipoSelected,
    copyAsComponent, copyAsIndependent, propagateComponentChange, moveConceptoTo,
    getSelectedCapituloId, deleteConcepto,
  };
}
