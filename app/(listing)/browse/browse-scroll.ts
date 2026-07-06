/** Sticky site header (~108px) + 16px buffer. Keep in sync with section scroll-margin. */
export const BROWSE_STATE_SCROLL_OFFSET = 128;

export function getBrowseScrollOffset() {
  if (typeof document === 'undefined') {
    return BROWSE_STATE_SCROLL_OFFSET;
  }

  const header = document.querySelector('header.sticky');
  if (header instanceof HTMLElement) {
    return header.offsetHeight + 16;
  }

  return BROWSE_STATE_SCROLL_OFFSET;
}

export function scrollToBrowseState(slug: string, behavior: ScrollBehavior = 'smooth') {
  const target = document.getElementById(`state-${slug}`);
  if (!target) {
    return;
  }

  const offset = getBrowseScrollOffset();
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top, behavior });
  window.history.replaceState(null, '', `#state-${slug}`);
}
