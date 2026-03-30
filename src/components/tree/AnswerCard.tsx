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
 * Brutalist style: thick black border, hard offset shadow,
 * hover moves card into its own shadow.
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
        w-full min-h-[48px] rounded-lg border-2 border-[#1A1A1A]
        px-5 py-4 text-start font-semibold
        transition-all duration-150 ease-in-out
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#1A1A1A]
        ${
          selected
            ? 'bg-[#FFD700] text-[#1A1A1A] shadow-[3px_3px_0_#FFC107,_4.5px_4.5px_0_#1A1A1A]'
            : 'bg-white text-foreground shadow-[2.5px_2.5px_0_#1A1A1A] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1px_1px_0_#1A1A1A] hover:bg-[#FFD700]'
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
