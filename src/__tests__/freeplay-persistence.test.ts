import { describe, it, expect, beforeEach } from "vitest";
import {
  recordGesture,
  getGestureHistory,
  clearGestureHistory,
  loadProgress,
} from "@/lib/persistence";

describe("Free Play Gesture History Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("recordGesture saves gesture with meaning and timestamp", () => {
    recordGesture("open_palm", "Hello / Open Palm");
    const history = getGestureHistory();
    expect(history).toHaveLength(1);
    expect(history[0].gesture).toBe("open_palm");
    expect(history[0].meaning).toBe("Hello / Open Palm");
    expect(history[0].timestamp).toBeGreaterThan(0);
  });

  it("recordGesture without args just increments counter", () => {
    recordGesture();
    const progress = loadProgress();
    expect(progress.gesturesRecorded).toBe(1);
    expect(getGestureHistory()).toHaveLength(0);
  });

  it("history is prepended (newest first)", () => {
    recordGesture("fist", "A / Stop");
    recordGesture("open_palm", "Hello / Open Palm");
    const history = getGestureHistory();
    expect(history[0].gesture).toBe("open_palm");
    expect(history[1].gesture).toBe("fist");
  });

  it("history is capped at 100 entries", () => {
    for (let i = 0; i < 120; i++) {
      recordGesture("fist", `Gesture ${i}`);
    }
    const history = getGestureHistory();
    expect(history).toHaveLength(100);
    // Most recent should be first
    expect(history[0].meaning).toBe("Gesture 119");
  });

  it("clearGestureHistory empties the history", () => {
    recordGesture("fist", "A / Stop");
    recordGesture("open_palm", "Hello / Open Palm");
    clearGestureHistory();
    const history = getGestureHistory();
    expect(history).toHaveLength(0);
  });

  it("clearGestureHistory does not reset gesture count", () => {
    recordGesture("fist", "A / Stop");
    clearGestureHistory();
    const progress = loadProgress();
    expect(progress.gesturesRecorded).toBe(1);
    expect(progress.totalGestures).toBe(1);
  });

  it("history persists across loadProgress calls", () => {
    recordGesture("peace", "Victory / Peace");
    const history1 = getGestureHistory();
    const history2 = getGestureHistory();
    expect(history1).toEqual(history2);
    expect(history1).toHaveLength(1);
  });

  it("multiple gestures accumulate correctly", () => {
    recordGesture("fist", "A");
    recordGesture("open_palm", "B");
    recordGesture("peace", "C");
    recordGesture("L", "D");
    const history = getGestureHistory();
    expect(history).toHaveLength(4);
    expect(history.map((h) => h.gesture)).toEqual(["L", "peace", "open_palm", "fist"]);
  });
});
