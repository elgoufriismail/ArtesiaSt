import { TEXTURES } from '@/content/assets';

/** Grain overlay (stand-in texture), mix-blend-mode overlay. Tile 'a' renders at 128px, 'b' at 100px. */
export function NoiseOverlay({ tile = 'a', opacity = 0.1 }: { tile?: 'a' | 'b'; opacity?: number }) {
  const src = tile === 'a' ? TEXTURES.noiseA : TEXTURES.noiseB;
  const size = tile === 'a' ? '128px' : '100px 100px';
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden', opacity, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: `url(${src})`, backgroundRepeat: 'repeat', backgroundSize: size }}
    />
  );
}
