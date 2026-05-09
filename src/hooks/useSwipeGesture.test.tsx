import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useSwipeGesture } from "./useSwipeGesture";

/**
 * Test harness wraps useSwipeGesture and exposes inner regions that mimic
 * the real app structure: a free swipe area, a chart area (data-no-swipe),
 * a button (BottomNav-like tap), and a drawer-like region (also no-swipe).
 */
function Harness({
  onSwipeLeft,
  onSwipeRight,
}: {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}) {
  const handlers = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    threshold: 80,
    dominanceRatio: 1.8,
  });
  return (
    <div data-testid="tabs" {...handlers} style={{ width: 400, height: 400 }}>
      <div data-testid="free-area" style={{ width: 400, height: 100 }}>
        free
      </div>
      <div data-testid="chart" data-no-swipe="true" style={{ width: 400, height: 100 }}>
        chart
      </div>
      <button data-testid="bottom-nav-btn" type="button">
        nav
      </button>
      {/* Mimic a drawer rendered via portal but with no-swipe boundary */}
      <div data-testid="drawer" data-no-swipe="true">
        <p>drawer body</p>
      </div>
    </div>
  );
}

const swipe = (
  el: HTMLElement,
  fromX: number,
  toX: number,
  fromY = 200,
  toY = 200,
) => {
  fireEvent.touchStart(el, {
    touches: [{ clientX: fromX, clientY: fromY }],
    target: el,
  });
  fireEvent.touchEnd(el, {
    changedTouches: [{ clientX: toX, clientY: toY }],
    target: el,
  });
};

describe("useSwipeGesture", () => {
  it("triggers onSwipeLeft for valid horizontal swipe in free area", () => {
    const left = vi.fn();
    const right = vi.fn();
    render(<Harness onSwipeLeft={left} onSwipeRight={right} />);
    const target = screen.getByTestId("free-area");
    swipe(target, 300, 100); // delta -200, dominant horizontal
    expect(left).toHaveBeenCalledTimes(1);
    expect(right).not.toHaveBeenCalled();
  });

  it("triggers onSwipeRight for valid rightward swipe", () => {
    const left = vi.fn();
    const right = vi.fn();
    render(<Harness onSwipeLeft={left} onSwipeRight={right} />);
    swipe(screen.getByTestId("free-area"), 50, 250);
    expect(right).toHaveBeenCalledTimes(1);
    expect(left).not.toHaveBeenCalled();
  });

  it("does NOT switch tabs when swipe starts inside a chart (data-no-swipe)", () => {
    const left = vi.fn();
    const right = vi.fn();
    render(<Harness onSwipeLeft={left} onSwipeRight={right} />);
    swipe(screen.getByTestId("chart"), 300, 50);
    expect(left).not.toHaveBeenCalled();
    expect(right).not.toHaveBeenCalled();
  });

  it("does NOT count a tap on BottomNav button as swipe", () => {
    const left = vi.fn();
    const right = vi.fn();
    render(<Harness onSwipeLeft={left} onSwipeRight={right} />);
    const btn = screen.getByTestId("bottom-nav-btn");
    // small delta + interactive target
    swipe(btn, 100, 105);
    expect(left).not.toHaveBeenCalled();
    expect(right).not.toHaveBeenCalled();
  });

  it("does NOT switch tabs when swipe happens inside a drawer (no-swipe boundary)", () => {
    const left = vi.fn();
    const right = vi.fn();
    render(<Harness onSwipeLeft={left} onSwipeRight={right} />);
    swipe(screen.getByTestId("drawer"), 300, 50);
    expect(left).not.toHaveBeenCalled();
    expect(right).not.toHaveBeenCalled();
  });

  it("ignores mostly-vertical gestures (scroll)", () => {
    const left = vi.fn();
    const right = vi.fn();
    render(<Harness onSwipeLeft={left} onSwipeRight={right} />);
    swipe(screen.getByTestId("free-area"), 300, 200, 100, 400); // dx=-100, dy=300
    expect(left).not.toHaveBeenCalled();
    expect(right).not.toHaveBeenCalled();
  });

  it("ignores multi-touch (pinch/zoom)", () => {
    const left = vi.fn();
    const right = vi.fn();
    render(<Harness onSwipeLeft={left} onSwipeRight={right} />);
    const el = screen.getByTestId("free-area");
    fireEvent.touchStart(el, {
      touches: [
        { clientX: 300, clientY: 200 },
        { clientX: 100, clientY: 200 },
      ],
    });
    fireEvent.touchEnd(el, {
      changedTouches: [{ clientX: 100, clientY: 200 }],
    });
    expect(left).not.toHaveBeenCalled();
    expect(right).not.toHaveBeenCalled();
  });
});