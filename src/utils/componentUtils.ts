import { v4 as uuidv4 } from 'uuid';
import type { ConceptoPresupuesto } from '../types';

interface CloneResult {
  cloned: Record<string, ConceptoPresupuesto>;
  newRootId: string;
  idMap: Record<string, string>; // old id -> new id
}

export function deepCloneSubtree(
  conceptos: Record<string, ConceptoPresupuesto>,
  rootId: string,
  newParentId: string | null,
  newNivel: number,
  linkToSource: boolean,
): CloneResult {
  const cloned: Record<string, ConceptoPresupuesto> = {};
  const idMap: Record<string, string> = {};

  function cloneNode(id: string, parentId: string | null, nivel: number): string {
    const original = conceptos[id];
    if (!original) return id;

    const newId = uuidv4();
    idMap[id] = newId;

    // Clone children first to get their new IDs
    const newChildrenIds = original.childrenIds.map(childId =>
      cloneNode(childId, newId, nivel + 1)
    );

    cloned[newId] = {
      ...original,
      id: newId,
      parentId,
      childrenIds: newChildrenIds,
      nivel,
      overrides: undefined, // Fresh copy, no overrides
      componentSourceId: linkToSource ? id : undefined,
      isComponentSource: false,
    };

    return newId;
  }

  const newRootId = cloneNode(rootId, newParentId, newNivel);
  return { cloned, newRootId, idMap };
}
