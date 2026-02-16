/**
 * Decision tree types for SOSpermesso residence permit wizard.
 *
 * The tree is a directed acyclic graph where:
 * - Question nodes present options to the user
 * - Result nodes display the outcome (permit type or denial)
 * - Edges connect questions to their possible next nodes
 */

export interface ResultSection {
  heading: string;
  content: string;
}

export interface ResultLink {
  label: string;
  url: string;
  type: 'guide' | 'legal_aid' | 'external';
}

export interface TreeNode {
  id: string;
  type: 'question' | 'result' | 'info';
  /** Question text shown to the user (question and info nodes) */
  question?: string;
  /** Short description for question context */
  description?: string;
  /** Result card title (result nodes only) */
  title?: string;
  /** Warm intro paragraph with [Nome] placeholder (result nodes only) */
  introText?: string;
  /** FAQ-style sections in display order (result nodes only) */
  sections?: ResultSection[];
  /** Guide + legal aid links (result nodes only) */
  links?: ResultLink[];
  /** Emergency phone numbers, e.g. "800 290 290" (result nodes only) */
  emergencyNumbers?: string[];
  // Legacy fields kept for backward compat during migration
  /** @deprecated Use introText + sections instead */
  resultDescription?: string;
  /** @deprecated Use sections instead */
  duration?: string;
  /** @deprecated Use sections instead */
  requirements?: string[];
  /** @deprecated Use sections instead */
  notes?: string;
  /** @deprecated Use links instead */
  link?: string;
}

export interface TreeEdge {
  /** Source node ID */
  from: string;
  /** Target node ID */
  to: string;
  /** Display label (Italian answer text) */
  label: string;
  /** Optional longer description */
  description?: string;
  /** Unique key within the source node's edges, used for programmatic selection */
  optionKey: string;
}

export interface TreeData {
  /** All nodes indexed by ID */
  nodes: Record<string, TreeNode>;
  /** All edges (connections between nodes) */
  edges: TreeEdge[];
  /** ID of the first node in the tree */
  startNodeId: string;
}
