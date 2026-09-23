import type { SiteContent } from './types';

/**
 * Stand-in site content. Populated in the implementation phase with freshly written copy that fits
 * docs/architecture/text-budgets.json. Brand is a placeholder to be replaced in the modification phase.
 */
export const BRAND = { name: 'Calm Shore', wordmark: 'calm—shore' } as const satisfies SiteContent['brand'];
