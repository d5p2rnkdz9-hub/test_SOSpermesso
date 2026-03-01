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
 * Styled to match Sito_Nuovo card system.
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
        w-full min-h-[48px] rounded-2xl border-2
        px-5 py-4 text-start font-medium
        transition-all duration-[250ms] ease-in-out
        active:translate-y-0 active:scale-[0.98]
        ${
          selected
            ? 'border-[#FFC107] bg-gradient-to-br from-[#FFF9C4] to-[#FFD700] text-[#5D4E00] shadow-[0_4px_15px_rgba(255,215,0,0.3)]'
            : 'border-border bg-white text-foreground shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)] hover:border-[#FFD700]/40'
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
