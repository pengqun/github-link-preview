export interface PopupPosition {
  top: number;
  left: number;
}

export function calculatePosition(
  anchorRect: DOMRect,
  popupRect: DOMRect,
  viewport: { width: number; height: number; scrollX: number; scrollY: number },
): PopupPosition {
  let top = anchorRect.bottom + viewport.scrollY;
  let left = anchorRect.left + viewport.scrollX;

  // Check right boundary
  if (left + popupRect.width > viewport.width) {
    left = viewport.width - popupRect.width - 10;
  }

  // Check bottom boundary
  if (top + popupRect.height > viewport.height + viewport.scrollY) {
    top = anchorRect.top + viewport.scrollY - popupRect.height;
  }

  return { top, left };
}

export function applyPosition(
  popup: HTMLElement,
  anchor: HTMLElement,
): void {
  const anchorRect = anchor.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  };

  const { top, left } = calculatePosition(anchorRect, popupRect, viewport);
  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
}
