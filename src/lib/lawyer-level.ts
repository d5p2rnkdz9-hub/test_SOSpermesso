/**
 * Derives the lawyer-needed level from a result node's sections.
 *
 * Checks the "Mi serve un avvocato?" section for emoji markers:
 * - Green circle (U+1F7E2) -> 'self' (user can handle it alone)
 * - Anything else (orange, SOS, no marker) -> 'recommended' (consult a lawyer)
 * - No matching section -> 'recommended' (conservative default for complex cases)
 */

import type { ResultSection } from '@/types/tree';

export type LawyerLevel = 'self' | 'recommended';

/**
 * Derive lawyer-needed level from result node sections.
 *
 * Looks for a section whose heading contains "avvocato" (case-insensitive)
 * and checks its content for the green circle emoji marker.
 */
export function getLawyerLevel(sections: ResultSection[]): LawyerLevel {
  // Check for green checkmark (✅) in any section heading — used by rinnovo tree
  const greenSection = sections.find((s) => s.heading.includes('\u2705'));
  if (greenSection) return 'self';

  // Check for "avvocato" section with green circle emoji — used by main tree
  const lawyerSection = sections.find((s) =>
    s.heading.toLowerCase().includes('avvocato'),
  );

  if (!lawyerSection) return 'recommended';

  // Green circle emoji = user can handle it alone
  if (lawyerSection.content.includes('\u{1F7E2}')) return 'self';

  // Orange, SOS, or any other marker = lawyer recommended
  return 'recommended';
}
