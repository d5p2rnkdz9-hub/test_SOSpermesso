/**
 * Decision tree types for SOSpermesso residence permit wizard.
 *
 * The tree is a directed acyclic graph where:
 * - Question nodes present options to the user
 * - Result nodes display the outcome (permit type or denial)
 * - Edges connect questions to their possible next nodes
 */

export interface TreeNode {
  id: string;
  type: 'question' | 'result';
  /** Question text shown to the user (question nodes only) */
  question?: string;
  /** Short description for question context */
  description?: string;
  /** Result card title, may include emoji prefix (result nodes only) */
  title?: string;
  /** Detailed result explanation (result nodes only) */
  resultDescription?: string;
  /** Permit duration, e.g. "2 anni (rinnovabile)" */
  duration?: string;
  /** List of requirements for the permit */
  requirements?: string[];
  /** Additional notes or warnings */
  notes?: string;
  /** External link for more information */
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
