import { TEXTURES } from '@/content/assets';

/** Grain overlay (stand-in texture), mix-blend-mode overlay. Tile 'a' renders at 128px, 'b' at 100px.
 *  `inset` overrides the default full cover (e.g. the Journal "Noize" layer runs 43 / 44 px past the image). */
export function NoiseOverlay({ tile = 'a', opacity = 0.1, inset = '0', dataRef }: { tile?: 'a' | 'b'; opacity?: number; inset?: string; dataRef?: string }) {
  const src = tile === 'a' ? TEXTURES.noiseA : TEXTURES.noiseB;
  const size = tile === 'a' ? '128px' : '100px 100px';
  return (
    <div
      aria-hidden="true"
      data-ref={dataRef}
      style={{ position: 'absolute', inset, zIndex: 1, overflow: 'hidden', opacity, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: `url(${src})`, backgroundRepeat: 'repeat', backgroundSize: size }}
    />
  );
}
