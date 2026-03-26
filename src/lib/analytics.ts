export type TreeType = 'posso_avere' | 'conversione' | 'rinnovo_conversione';

export interface TreeStepPayload {
  sessionToken: string;
  treeType: TreeType;
  currentNodeId: string;
  answers: Record<string, string>;
  path: string[];
  stepsCount: number;
  locale: string;
  userName: string | null;
  sessionStartedAt: string;
}

export interface TreeSessionPayload {
  sessionToken: string;
  treeType: TreeType;
  outcomeId: string;
  outcomeSlug: string;
  path: string[];
  answers: Record<string, string>;
  stepsCount: number;
  locale: string;
  userAgent: string;
  userName: string | null;
  durationMs: number | null;
  sessionStartedAt: string;
}
