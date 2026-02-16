import { LanguageSelector } from './LanguageSelector';

export function StickyHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-4">
        <a
          href="https://sospermesso.it"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-bold text-foreground"
        >
          SOSpermesso
        </a>
        <LanguageSelector />
      </div>
    </header>
  );
}
