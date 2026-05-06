/**
 * Runtime translation of TreeData for non-IT locales.
 *
 * Italian is the source of truth. For each non-IT locale we ship a flat JSON map
 * `{italianText: translatedText}` at translations/{locale}.json. At render time we
 * walk the tree and replace each user-visible Italian string with its translation,
 * falling back to Italian on a miss.
 *
 * Helpers are pure & memo-friendly — caller can wrap in useMemo or call once per
 * server render.
 */

import type { TreeData, TreeNode, ResultSection } from '@/types/tree';

export type TranslationMap = Record<string, string>;

/** Lookup IT text → translated text; fall through to IT on miss or empty input. */
export function tx(text: string | undefined, map: TranslationMap | null): string | undefined {
  if (!text) return text;
  if (!map) return text;
  return map[text] ?? text;
}

/** Translate a single tree node (returns new object; original is not mutated). */
export function translateNode(node: TreeNode, map: TranslationMap | null): TreeNode {
  if (!map) return node;
  const out: TreeNode = { ...node };
  out.question = tx(node.question, map);
  out.description = tx(node.description, map);
  out.title = tx(node.title, map);
  out.introText = tx(node.introText, map);
  if (node.sections) {
    out.sections = node.sections.map<ResultSection>((s) => ({
      heading: tx(s.heading, map) ?? s.heading,
      content: tx(s.content, map) ?? s.content,
    }));
  }
  return out;
}

/** Translate every node + edge in a TreeData. Returns new object. */
export function translateTree(tree: TreeData, map: TranslationMap | null): TreeData {
  if (!map) return tree;
  const nodes: Record<string, TreeNode> = {};
  for (const [id, node] of Object.entries(tree.nodes)) {
    nodes[id] = translateNode(node, map);
  }
  const edges = tree.edges.map((e) => ({
    ...e,
    label: tx(e.label, map) ?? e.label,
    description: tx(e.description, map),
  }));
  return { ...tree, nodes, edges };
}
