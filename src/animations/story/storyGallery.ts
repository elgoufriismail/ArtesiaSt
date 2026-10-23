import { gsap } from '../core/gsap';
import { ANIM } from '../config';

/**
 * Story gallery (client change 2026-10-23, Option A): reveal + hover for the photo grid.
 *
 * Markup per photo (data-gallery="item"): [frame] (clip-path, overflow hidden) → [zoom] (scale + lean) → the
 * ParallaxImage, and a [caption]. One [badge] per gallery follows the cursor.
 *  reveal: once per photo when it enters (rootMargin −10 % bottom): frame inset(100% 0 0 0) → inset(0), zoom
 *          zoomFrom → 1, caption fades up; photos entering in the same frame are staggered in DOM order.
 *  hover:  fine pointers only (`hover` flag + pointerType mouse): zoom → scale, zoom leans toward the cursor
 *          (± lean px at the frame edge), badge scales in and follows the cursor. Frame mat, sibling dimming
 *          and the caption line are CSS (gallery[data-hover="on"]).
 * Tweens start in observer / pointer callbacks, outside the useGsap context, so the returned cleanup kills them
 * and clears every inline style this module sets.
 */
export function storyGallery(gallery: HTMLElement, opts: { hover: boolean }, cfg = ANIM.storyGallery) {
  const items = [...gallery.querySelectorAll<HTMLElement>('[data-gallery="item"]')];
  const part = (it: HTMLElement, k: 'frame' | 'zoom' | 'caption') => it.querySelector<HTMLElement>(`[data-gallery="${k}"]`)!;
  const frames = items.map((it) => part(it, 'frame'));
  const zooms = items.map((it) => part(it, 'zoom'));
  const captions = items.map((it) => part(it, 'caption'));
  const badge = gallery.querySelector<HTMLElement>('[data-gallery="badge"]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const off: (() => void)[] = [];
  // set by the hover block: a photo that finishes revealing while hovered zooms to the hover scale
  let onRevealed: ((i: number) => void) | null = null;

  // ── reveal ──
  if (!reduce) {
    const r = cfg.reveal;
    gsap.set(frames, { clipPath: 'inset(100% 0% 0% 0% round 0px)' });
    gsap.set(zooms, { scale: r.zoomFrom });
    gsap.set(captions, { opacity: 0, y: r.caption.y });
    const io = new IntersectionObserver((entries) => {
      const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)
        .sort((a, b) => items.indexOf(a) - items.indexOf(b));
      entering.forEach((it, n) => {
        io.unobserve(it);
        const i = items.indexOf(it), delay = n * r.stagger;
        gsap.to(frames[i], { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: r.frame.duration, ease: r.frame.ease, delay, clearProps: 'clipPath' });
        gsap.to(zooms[i], { scale: 1, duration: r.zoom.duration, ease: r.zoom.ease, delay, overwrite: 'auto', onComplete: () => onRevealed?.(i) });
        gsap.to(captions[i], { opacity: 1, y: 0, duration: r.caption.duration, ease: r.caption.ease, delay: delay + r.caption.delay, clearProps: 'opacity,transform' });
      });
    }, { rootMargin: r.rootMargin, threshold: 0.1 });
    items.forEach((it) => io.observe(it));
    off.push(() => io.disconnect());
  }

  // ── hover ──
  if (opts.hover) {
    const h = cfg.hover;
    gallery.dataset.hover = 'on';
    if (badge) gsap.set(badge, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
    const badgeX = badge ? gsap.quickTo(badge, 'x', h.follow) : null;
    const badgeY = badge ? gsap.quickTo(badge, 'y', h.follow) : null;
    const leanX = zooms.map((z) => gsap.quickTo(z, 'x', h.follow));
    const leanY = zooms.map((z) => gsap.quickTo(z, 'y', h.follow));
    let active = -1, lastX = 0, lastY = 0;
    onRevealed = (i) => { if (active === i) gsap.to(zooms[i], { scale: h.scale, duration: h.enter.duration, ease: h.enter.ease, overwrite: 'auto' }); };

    const follow = () => {
      if (active < 0) return;
      const g = gallery.getBoundingClientRect();
      badgeX?.(lastX - g.left); badgeY?.(lastY - g.top);
      const f = frames[active].getBoundingClientRect();
      const dx = (lastX - (f.left + f.width / 2)) / (f.width / 2), dy = (lastY - (f.top + f.height / 2)) / (f.height / 2);
      leanX[active](gsap.utils.clamp(-1, 1, dx) * h.lean); leanY[active](gsap.utils.clamp(-1, 1, dy) * h.lean);
    };
    const enter = (i: number) => {
      if (active === i) return;
      if (active >= 0) leave();
      active = i;
      items[i].dataset.active = '';
      gsap.to(zooms[i], { scale: h.scale, duration: h.enter.duration, ease: h.enter.ease, overwrite: 'auto' });
      if (badge) {
        const g = gallery.getBoundingClientRect();
        if (Number(gsap.getProperty(badge, 'scale')) < 0.05) gsap.set(badge, { x: lastX - g.left, y: lastY - g.top });
        gsap.to(badge, { scale: 1, opacity: 1, duration: h.badgeIn.duration, ease: h.badgeIn.ease, overwrite: 'auto' });
      }
      follow();
    };
    const leave = () => {
      if (active < 0) return;
      const i = active;
      active = -1;
      delete items[i].dataset.active;
      gsap.to(zooms[i], { scale: 1, duration: h.leave.duration, ease: h.leave.ease, overwrite: 'auto' });
      leanX[i](0); leanY[i](0);
      if (badge) gsap.to(badge, { scale: 0, opacity: 0, ...h.badgeOut, overwrite: 'auto' });
    };
    const hit = () => {
      const el = document.elementFromPoint(lastX, lastY)?.closest<HTMLElement>('[data-gallery="item"]');
      return el ? items.indexOf(el) : -1;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      lastX = e.clientX; lastY = e.clientY;
      const i = hit();
      if (i >= 0) enter(i); else leave();
      follow();
    };
    const onOut = (e: PointerEvent) => { if (!gallery.contains(e.relatedTarget as Node | null)) leave(); };
    // the page scrolls under a still cursor: re-hit-test so the badge and the hovered photo stay in sync
    const onScroll = () => { if (active < 0) return; const i = hit(); if (i >= 0) { enter(i); follow(); } else leave(); };
    gallery.addEventListener('pointermove', onMove);
    gallery.addEventListener('pointerout', onOut);
    window.addEventListener('scroll', onScroll, { passive: true });
    off.push(() => {
      gallery.removeEventListener('pointermove', onMove);
      gallery.removeEventListener('pointerout', onOut);
      window.removeEventListener('scroll', onScroll);
      items.forEach((it) => delete it.dataset.active);
      delete gallery.dataset.hover;
      onRevealed = null;
    });
  }

  return () => {
    off.forEach((f) => f());
    const all = [...frames, ...zooms, ...captions, ...(badge ? [badge] : [])];
    gsap.killTweensOf(all);
    gsap.set(all, { clearProps: 'all' });
  };
}
