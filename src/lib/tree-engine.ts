/**
 * Pure functions for decision tree graph traversal.
 *
 * All functions take TreeData as a parameter -- no global state.
 * This makes them testable, composable, and independent of any specific tree instance.
 */

import type { TreeData, TreeEdge, TreeNode } from '@/types/tree';

/**
 * Returns all outgoing edges for a given node, preserving order from the edges array.
 * For question nodes, these represent the answer options.
 * For result nodes, this returns an empty array.
 */
export function getOptionsForNode(tree: TreeData, nodeId: string): TreeEdge[] {
  return tree.edges.filter((edge) => edge.from === nodeId);
}

/**
 * Given a current node and a selected option key, returns the ID of the next node.
 * Returns null if no matching edge is found.
 */
export function getNextNodeId(
  tree: TreeData,
  currentNodeId: string,
  optionKey: string,
): string | null {
  const edge = tree.edges.find(
    (e) => e.from === currentNodeId && e.optionKey === optionKey,
  );
  return edge?.to ?? null;
}

/**
 * Returns true if the node is a terminal (result) node.
 * Result nodes have no outgoing edges and display a permit outcome.
 */
export function isTerminalNode(tree: TreeData, nodeId: string): boolean {
  return tree.nodes[nodeId]?.type === 'result';
}

/**
 * Simple node lookup by ID.
 * Returns undefined if the node does not exist.
 */
export function getNode(tree: TreeData, nodeId: string): TreeNode | undefined {
  return tree.nodes[nodeId];
}

/**
 * Validates the integrity of a TreeData structure.
 * Returns an array of error strings. An empty array means the tree is valid.
 *
 * Checks performed:
 * (a) Start node exists in nodes
 * (b) All edge "from" and "to" reference existing nodes
 * (c) All question nodes have at least one outgoing edge
 * (d) All result nodes have zero outgoing edges
 * (e) All nodes are reachable from start via BFS
 */
export function validateTree(tree: TreeData): string[] {
  const errors: string[] = [];

  // (a) Start node exists
  if (!tree.nodes[tree.startNodeId]) {
    errors.push(`Start node "${tree.startNodeId}" does not exist in nodes`);
  }

  // (b) All edge references are valid
  for (const edge of tree.edges) {
    if (!tree.nodes[edge.from]) {
      errors.push(
        `Edge from "${edge.from}" to "${edge.to}" references non-existent source node`,
      );
    }
    if (!tree.nodes[edge.to]) {
      errors.push(
        `Edge from "${edge.from}" to "${edge.to}" references non-existent target node`,
      );
    }
  }

  // Build outgoing edge map for checks (c) and (d)
  const outgoingCount = new Map<string, number>();
  for (const nodeId of Object.keys(tree.nodes)) {
    outgoingCount.set(nodeId, 0);
  }
  for (const edge of tree.edges) {
    const count = outgoingCount.get(edge.from) ?? 0;
    outgoingCount.set(edge.from, count + 1);
  }

  for (const [nodeId, node] of Object.entries(tree.nodes)) {
    const count = outgoingCount.get(nodeId) ?? 0;

    // (c) Question nodes must have at least one outgoing edge
    if (node.type === 'question' && count === 0) {
      errors.push(`Question node "${nodeId}" has no outgoing edges`);
    }

    // (d) Result nodes must have zero outgoing edges
    if (node.type === 'result' && count > 0) {
      errors.push(
        `Result node "${nodeId}" has ${count} outgoing edge(s) but should have none`,
      );
    }
  }

  // (e) All nodes reachable from start via BFS
  const visited = new Set<string>();
  const queue: string[] = [tree.startNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    for (const edge of tree.edges) {
      if (edge.from === current && !visited.has(edge.to)) {
        queue.push(edge.to);
      }
    }
  }

  for (const nodeId of Object.keys(tree.nodes)) {
    if (!visited.has(nodeId)) {
      errors.push(`Node "${nodeId}" is not reachable from start node`);
    }
  }

  return errors;
}
