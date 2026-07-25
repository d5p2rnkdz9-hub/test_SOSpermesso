'use client';

import { useUiStore } from '@/store/ui-store';

interface AnswerCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

/**
 * Tappable card for a single answer option.
 *
 * Brutalist style: thick border, hard offset shadow,
 * hover moves card into its own shadow.
 * Sportello mode: tighter padding for faster scanning.
 */
export function AnswerCard({
  label,
  description,
  selected,
  onSelect,
  disabled,
}: AnswerCardProps) {
  const compact = useUiStore((s) => s.mode) === 'sportello';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`
        w-full rounded-lg border-2 border-foreground
        text-start font-semibold
        transition-all duration-150 ease-in-out
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_hsl(var(--foreground))]
        ${compact ? 'min-h-[40px] px-4 py-2.5' : 'min-h-[48px] px-5 py-4'}
        ${
          selected
            ? 'bg-primary text-primary-foreground shadow-[3px_3px_0_hsl(var(--accent)),_4.5px_4.5px_0_hsl(var(--foreground))]'
            : 'bg-card text-foreground shadow-[2.5px_2.5px_0_hsl(var(--foreground))] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1px_1px_0_hsl(var(--foreground))] hover:bg-primary hover:text-primary-foreground'
        }
        ${disabled ? 'pointer-events-none opacity-70' : ''}
      `}
    >
      {label}
      {description && (
        <span className={`mt-1 block font-normal opacity-80 ${compact ? 'text-xs' : 'text-sm'}`}>
          {description}
        </span>
      )}
    </button>
  );
}
