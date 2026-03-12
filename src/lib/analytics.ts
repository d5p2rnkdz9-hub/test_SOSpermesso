export interface TreeSessionPayload {
  sessionToken: string;
  outcomeId: string;
  outcomeSlug: string;
  path: string[];
  answers: Record<string, string>;
  stepsCount: number;
  locale: string;
  userAgent: string;
  durationMs: number | null;
  sessionStartedAt: string;
}
