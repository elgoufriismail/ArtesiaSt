import { Fragment } from 'react';

/**
 * Splits text into inline-block word spans (data-word) for the hero word reveal (B1) and the
 * philosophy scroll reveal (B15). Regular spaces sit BETWEEN the spans, so line breaking is
 * identical to the plain text (a trailing space inside an inline-block would change wrapping).
 */
export function SplitWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span data-word className={className} style={{ display: 'inline-block' }}>{w}</span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
