/**
 * Splits text into inline-block word spans (data-word) for the hero word reveal (B1) and the
 * philosophy scroll reveal (B15). Spaces are preserved between spans so wrapping matches plain text.
 */
export function SplitWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <span key={i} data-word className={className} style={{ display: 'inline-block' }}>
          {w}
          {i < words.length - 1 ? '\u00a0' : ''}
        </span>
      ))}
    </>
  );
}
