import { STANDINS, type StandInSlot } from '@/content/assets';

/**
 * Stand-in photo with the original's crop geometry (object-fit / object-position from ASSETS.md).
 * Marked data-standin="photo" so the pixel diff masks it. Swap files in public/standins to replace.
 */
export function StandInImage({ slot, className, style, sizes = '100vw', position }: {
  slot: StandInSlot; className?: string; style?: React.CSSProperties; sizes?: string; position?: string;
}) {
  const a = STANDINS[slot];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={a.src}
      width={a.width}
      height={a.height}
      sizes={sizes}
      alt=""
      decoding="async"
      data-standin="photo"
      className={className}
      style={{ objectFit: 'cover', objectPosition: position ?? a.position, ...style }}
    />
  );
}
