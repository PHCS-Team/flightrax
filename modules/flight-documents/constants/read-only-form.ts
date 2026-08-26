// Applied to a form's <fieldset> when it renders in read-only mode.
// The shared ui controls fade themselves when disabled (opacity-50 on a
// white background), which reads as "temporarily unavailable" and is
// hard to read on the glass surface. In read-only mode the fields
// should instead look like the translucent read-only value cells the
// Weight & Balance givens use (border-primary-foreground/15 +
// bg-primary-foreground/10 + light text) — clearly not active inputs,
// but fully legible. The select chevron is hidden so triggers read as
// plain value cells.
// NOTE: colors must be text-primary-foreground, not text-foreground —
// GlassSurface remaps only the literal .text-foreground class, and these
// compound variants never carry it, so text-foreground would resolve to
// the raw (dark) theme token.
export const READ_ONLY_FIELDSET_CLASS =
  "[&_[data-slot=input]:disabled]:opacity-100 [&_[data-slot=input]:disabled]:border-primary-foreground/15 [&_[data-slot=input]:disabled]:bg-primary-foreground/10 [&_[data-slot=input]:disabled]:text-primary-foreground [&_[data-slot=input]:disabled]:placeholder:text-primary-foreground/40 [&_[data-slot=select-trigger]:disabled]:opacity-100 [&_[data-slot=select-trigger]:disabled]:border-primary-foreground/15 [&_[data-slot=select-trigger]:disabled]:bg-primary-foreground/10 [&_[data-slot=select-trigger]:disabled]:text-primary-foreground [&_[data-slot=select-trigger]:disabled_svg]:hidden [&_[data-slot=textarea]:disabled]:opacity-100 [&_[data-slot=textarea]:disabled]:border-primary-foreground/15 [&_[data-slot=textarea]:disabled]:bg-primary-foreground/10 [&_[data-slot=textarea]:disabled]:text-primary-foreground [&_[data-slot=textarea]:disabled]:placeholder:text-primary-foreground/40";
