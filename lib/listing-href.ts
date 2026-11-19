export function listingPageHref(basePath: string, page: number): string {
  if (page <= 1) return basePath;
  return `${basePath}/page/${page}`;
}
