/**
 * Invisible 8×8 scroll marker — same role and IDs as the original's marker <section>s
 * (STRUCTURE.md §2). Animation modules find them via [data-marker="<id>"]; positions are set by
 * the owning section's CSS (e.g. .root [data-marker="toggle-on-animation"] { top: 946px }).
 */
export function Marker({ id, anchor = false, className }: { id: string; anchor?: boolean; className?: string }) {
  // `anchor`: also an in-page link target (id), like the original's marker sections (e.g. ./#toggle-on-anchor)
  return <span className={className ? `marker ${className}` : 'marker'} id={anchor ? id : undefined} data-marker={id} aria-hidden="true" />;
}
