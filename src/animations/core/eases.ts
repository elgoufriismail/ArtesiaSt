import { CustomEase } from 'gsap/CustomEase';

/**
 * Cubic-bezier presets used by the original (docs/reconnaissance/ANIMATIONS.md §A),
 * registered as named GSAP eases. Use the names in configs: ease: 'framer'.
 */
export const BEZIERS = {
  framer: [0.44, 0, 0.56, 1], // Framer default ease-in-out
  entrance: [0.2, 0, 0.2, 1], // nav / hero entrance
  hero: [0.4, 0, 0.2, 1], // hero backdrop + waves load fade
  strong: [0.6, 0, 0.4, 1], // hero lines fade
  reveal: [0.22, 1, 0.36, 1], // client change: Story gallery reveal + hover (long, soft settle)
} as const;

export type EaseName = keyof typeof BEZIERS;

/** CSS equivalents for transitions implemented in CSS (tokens.css mirrors these). */
export const cssBezier = (name: EaseName) => `cubic-bezier(${BEZIERS[name].join(', ')})`;

export function registerEases() {
  for (const [name, [x1, y1, x2, y2]] of Object.entries(BEZIERS)) {
    CustomEase.create(name, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`);
  }
}
