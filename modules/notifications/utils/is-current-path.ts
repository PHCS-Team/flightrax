export function isCurrentPath(href: string) {
  return (
    new URL(href, window.location.origin).pathname === window.location.pathname
  );
}
