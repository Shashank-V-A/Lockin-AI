import { describe, it, expect } from "vitest";

/** Mirrors analytics timeline sort logic. */
function sortTimeline<T extends { createdAt: Date }>(events: T[]): T[] {
  return [...events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

describe("analytics timeline ordering", () => {
  it("sorts by createdAt across month boundaries", () => {
    const events = sortTimeline([
      { createdAt: new Date("2025-01-15"), date: "Jan 15, 2025", event: "old" },
      { createdAt: new Date("2025-03-02"), date: "Mar 2, 2025", event: "new" },
      { createdAt: new Date("2025-02-28"), date: "Feb 28, 2025", event: "mid" },
    ]);

    expect(events.map((e) => e.event)).toEqual(["new", "mid", "old"]);
  });
});
