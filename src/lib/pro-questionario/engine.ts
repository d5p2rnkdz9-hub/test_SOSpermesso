import type { ProEdge, ProNode, ProTree } from './types';

export function optionsOf(tree: ProTree, nodeId: string): ProEdge[] {
  return tree.edges.filter((e) => e.from === nodeId);
}

/**
 * Replays a path of option keys from the start node.
 * Stops at the first key that does not match (stale or hand-edited URL),
 * so a bad link lands on the last valid question instead of an error.
 */
export function replay(tree: ProTree, keys: readonly string[]) {
  const steps: { node: ProNode; edge: ProEdge }[] = [];
  let current = tree.nodes[tree.startNodeId];
  for (const key of keys) {
    if (!current || current.type !== 'question') break;
    const edge = optionsOf(tree, current.id).find((e) => e.optionKey === key);
    if (!edge || !tree.nodes[edge.to]) break;
    steps.push({ node: current, edge });
    current = tree.nodes[edge.to];
  }
  return { steps, current };
}

/** Structural problems: dangling edges, unreachable nodes, dead-end questions, duplicate keys. */
export function validateTree(tree: ProTree): string[] {
  const errors: string[] = [];
  if (!tree.nodes[tree.startNodeId]) errors.push(`start node ${tree.startNodeId} missing`);
  for (const [id, node] of Object.entries(tree.nodes)) {
    if (node.id !== id) errors.push(`node key ${id} ≠ id ${node.id}`);
  }
  const seen = new Set<string>();
  for (const e of tree.edges) {
    if (!tree.nodes[e.from]) errors.push(`edge from missing node ${e.from}`);
    if (!tree.nodes[e.to]) errors.push(`edge ${e.from} → missing node ${e.to}`);
    const k = `${e.from}::${e.optionKey}`;
    if (seen.has(k)) errors.push(`duplicate optionKey ${k}`);
    seen.add(k);
  }
  for (const node of Object.values(tree.nodes)) {
    if (node.type === 'question' && optionsOf(tree, node.id).length === 0) {
      errors.push(`question ${node.id} has no options`);
    }
  }
  const reachable = new Set<string>();
  const stack = [tree.startNodeId];
  while (stack.length) {
    const id = stack.pop()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const e of optionsOf(tree, id)) stack.push(e.to);
  }
  for (const id of Object.keys(tree.nodes)) {
    if (!reachable.has(id)) errors.push(`unreachable node ${id}`);
  }
  return errors;
}
