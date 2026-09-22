import { SmoothScroll } from './lib/smooth-scroll';
import { SECTIONS } from './sections/registry';

/**
 * Page shell mirroring the original skeleton (STRUCTURE.md §1):
 *   fixed layers (progressive blur, waves, nav) · Main Container (16 sections) · footer.
 * Fixed layers and footer are added in the implementation phase.
 */
export function App() {
  return (
    <SmoothScroll>
      <main style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {SECTIONS.map(({ ref, Component }) => (
          <Component key={ref} />
        ))}
      </main>
    </SmoothScroll>
  );
}
