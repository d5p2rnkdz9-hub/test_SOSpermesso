'use client';

import { DirectionProvider } from '@radix-ui/react-direction';

type Props = {
  dir: 'ltr' | 'rtl';
  children: React.ReactNode;
};

export function Providers({ dir, children }: Props) {
  return <DirectionProvider dir={dir}>{children}</DirectionProvider>;
}
