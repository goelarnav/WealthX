/** Uniform return shape for Server Actions, so client components can
 * branch on `ok` without throwing/catching across the server boundary. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
