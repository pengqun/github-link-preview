import { describe, it, expect } from "vitest";
import { calculatePosition } from "@/content/popup-positioner";

function makeRect(
  x: number,
  y: number,
  width: number,
  height: number,
): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  };
}

const defaultViewport = {
  width: 1920,
  height: 1080,
  scrollX: 0,
  scrollY: 0,
};

describe("calculatePosition", () => {
  it("positions popup below the anchor by default", () => {
    const anchor = makeRect(100, 50, 200, 20);
    const popup = makeRect(0, 0, 360, 150);
    const pos = calculatePosition(anchor, popup, defaultViewport);

    expect(pos.top).toBe(70); // anchor.bottom (50+20) + scrollY (0)
    expect(pos.left).toBe(100); // anchor.left + scrollX
  });

  it("adjusts left when popup overflows right edge", () => {
    const anchor = makeRect(1800, 50, 100, 20);
    const popup = makeRect(0, 0, 360, 150);
    const pos = calculatePosition(anchor, popup, defaultViewport);

    expect(pos.left).toBe(1920 - 360 - 10); // viewport.width - popup.width - 10
  });

  it("positions above anchor when popup overflows bottom", () => {
    const anchor = makeRect(100, 1000, 200, 20);
    const popup = makeRect(0, 0, 360, 150);
    const pos = calculatePosition(anchor, popup, defaultViewport);

    // anchor.top + scrollY - popup.height = 1000 + 0 - 150 = 850
    expect(pos.top).toBe(850);
  });

  it("accounts for scroll offset", () => {
    const anchor = makeRect(100, 50, 200, 20);
    const popup = makeRect(0, 0, 360, 150);
    const viewport = { ...defaultViewport, scrollX: 200, scrollY: 500 };
    const pos = calculatePosition(anchor, popup, viewport);

    expect(pos.top).toBe(70 + 500); // anchor.bottom + scrollY
    expect(pos.left).toBe(100 + 200); // anchor.left + scrollX
  });
});
