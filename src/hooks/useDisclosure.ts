'use client';

import { useCallback, useState } from 'react';

/** Open/closed state for menu, FAQ items and the pricing period switch. */
export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  return { open, setOpen, toggle } as const;
}
