/**
 * Invisible 8×8 scroll marker — same role and IDs as the original's marker <section>s
 * (STRUCTURE.md §2). Animation modules find them via [data-marker="<id>"]; positions are set by
 * the owning section's CSS (e.g. .root [data-marker="toggle-on-animation"] { top: 946px }).
 */
export function Marker({ id }: { id: string }) {
  return <span className="marker" data-marker={id} aria-hidden="true" />;
}
