'use client';

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
 * Full-width button with 48px+ touch target, selected/unselected
 * visual states, and active:scale press feedback.
 */
export function AnswerCard({
  label,
  description,
  selected,
  onSelect,
  disabled,
}: AnswerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`
        w-full min-h-[48px] rounded-xl border-2 border-foreground
        px-4 py-3 text-start font-medium
        transition-colors active:scale-[0.98]
        ${
          selected
            ? 'bg-foreground text-primary-foreground'
            : 'bg-foreground/5 text-card-foreground hover:bg-foreground/10'
        }
        ${disabled ? 'pointer-events-none opacity-70' : ''}
      `}
    >
      {label}
      {description && (
        <span className="mt-1 block text-sm font-normal opacity-80">
          {description}
        </span>
      )}
    </button>
  );
}
