import { gsap, ScrollTrigger } from '../core/gsap';
import { ANIM } from '../config';
import { marker } from '../core/scroll';
import { sequenceValue } from '@/lib/scroll-math';

/** B5 fixed waves layer (desktop): opacity 0 → 1 over How It Works entry, 1 → 0 over Big Quote entry. */
export function wavesBackground(layer: HTMLElement, cfg = ANIM.B5) {
  const targets = cfg.targets.map((id) => marker(id)).filter(Boolean) as HTMLElement[];
  if (targets.length !== cfg.targets.length) return null;
  // Targets inside not-yet-implemented sections have no real geometry → keep the layer hidden.
  if (targets.some((el) => el.closest('[data-stub]'))) return null;
  const setO = gsap.quickSetter(layer, 'opacity');
  const update = () => {
    const t = targets.map((el) => { const r = el.getBoundingClientRect(); return { docTop: r.top + window.scrollY, height: r.height, threshold: cfg.threshold }; });
    setO(sequenceValue([...cfg.values], t, window.scrollY, window.innerHeight));
  };
  return ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
}
