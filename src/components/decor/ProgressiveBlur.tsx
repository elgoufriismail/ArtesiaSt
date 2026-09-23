import styles from './ProgressiveBlur.module.css';

/**
 * Fixed progressive blur under the desktop nav (VISUAL.md §6): 8 stacked layers, backdrop blur
 * 0.15625 → 20 px (doubling), each masked to a 37.5 %-wide band stepping 12.5 % (to top), 220 px tall.
 * Desktop only (hidden on tablet/phone like the original).
 */
const LAYERS = [0.15625, 0.3125, 0.625, 1.25, 2.5, 5, 10, 20];

export function ProgressiveBlur() {
  return (
    <div className={styles.root} aria-hidden="true">
      {LAYERS.map((blur, i) => {
        const a = i * 12.5;
        const stops = i === 0
          ? `rgba(0,0,0,0) 0%, #000 12.5%, #000 25%, rgba(0,0,0,0) 37.5%`
          : i === LAYERS.length - 1
            ? `rgba(0,0,0,0) 87.5%, #000 100%`
            : i === LAYERS.length - 2
              ? `rgba(0,0,0,0) 75%, #000 87.5%, #000 100%`
              : `rgba(0,0,0,0) ${a}%, #000 ${a + 12.5}%, #000 ${a + 25}%, rgba(0,0,0,0) ${a + 37.5}%`;
        const mask = `linear-gradient(to top, ${stops})`;
        return <div key={blur} className={styles.layer} style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, maskImage: mask, WebkitMaskImage: mask }} />;
      })}
    </div>
  );
}
