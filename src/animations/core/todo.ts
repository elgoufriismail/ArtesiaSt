/** Marks an animation contract that is specified but not implemented yet (dev-only warning). */
export function pending(id: string, what: string) {
  if (process.env.NODE_ENV !== 'production') console.warn(`[anim ${id}] not implemented yet: ${what}`);
}
