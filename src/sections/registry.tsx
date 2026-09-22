import type { ComponentType } from 'react';

/**
 * Section order of the original homepage (docs/reconnaissance/STRUCTURE.md §2).
 * `ref` is the original Framer layer name — every clone element that corresponds to an
 * original layer carries `data-ref="<path>"` so tools/compare/geometry.mjs can match boxes.
 * Sections are stubs until the implementation phase.
 */
export interface SectionDef {
  ref: string;
  Component: ComponentType;
}

const stub = (ref: string): ComponentType =>
  function Stub() {
    return <section data-ref={ref} data-stub="" />;
  };

export const SECTIONS: SectionDef[] = [
  'Page Intro',
  'Toggle',
  'Our Services',
  'Our Philosophy',
  'Story A',
  'How It Works',
  'Ready to find your path?',
  'Pricing',
  'Text Section',
  'Big Quote',
  'Story B',
  'Journal',
  'Text Section#2',
  'Numbers',
  'FAQ',
  'Book A Session',
].map((ref) => ({ ref, Component: stub(ref) }));
