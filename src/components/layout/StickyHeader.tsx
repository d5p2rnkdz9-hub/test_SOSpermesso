import { BackButton } from '@/components/tree/BackButton';

import { LanguageSelector } from './LanguageSelector';

export function StickyHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/8 bg-white transition-shadow duration-200">
      <div className="mx-auto flex h-20 max-w-[520px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <a
            href="https://www.sospermesso.it"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-[250ms] ease-in-out hover:scale-[1.02] hover:drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
          >
            <img
              src="/logo-full.png"
              alt="SOSpermesso"
              className="h-14 w-auto sm:h-16"
            />
          </a>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
