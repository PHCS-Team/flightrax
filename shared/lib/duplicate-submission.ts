// A request that is sent twice — a double tap, or a retry after a slow
// connection dropped the first response — arrives as two identical writes a
// few seconds apart. Create actions that would otherwise make a second copy
// (or notify everyone twice) look for an identical row written by the same
// person inside this window and treat the repeat as the same submission.
export const DUPLICATE_SUBMISSION_WINDOW_MS = 5 * 60 * 1000;

export function duplicateSubmissionCutoff(
  windowMs: number = DUPLICATE_SUBMISSION_WINDOW_MS,
): string {
  return new Date(Date.now() - windowMs).toISOString();
}
