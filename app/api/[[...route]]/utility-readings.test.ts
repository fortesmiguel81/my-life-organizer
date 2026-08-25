import { describe, expect, it } from "vitest";

import { withAnomalyFlags } from "./utility-readings";

type Reading = {
  id: string;
  utilityType: string;
  periodStart: Date;
  usage: number;
};

function reading(
  id: string,
  usage: number,
  monthIndex: number,
  utilityType = "electricity"
): Reading {
  return { id, utilityType, usage, periodStart: new Date(2026, monthIndex, 1) };
}

describe("withAnomalyFlags", () => {
  it("returns an empty array for no readings", () => {
    expect(withAnomalyFlags([])).toEqual([]);
  });

  it("never flags a reading with fewer than 2 prior readings of the same type", () => {
    const readings = [reading("a", 500, 0), reading("b", 5000, 1)];
    const flagged = withAnomalyFlags(readings);

    for (const r of flagged) {
      expect(r.isAnomaly).toBe(false);
      expect(r.averageUsage).toBeNull();
    }
  });

  it("does not flag a reading close to the trailing average", () => {
    const readings = [
      reading("a", 500, 0),
      reading("b", 480, 1),
      reading("c", 510, 2),
      reading("d", 505, 3),
    ];
    const flagged = withAnomalyFlags(readings);
    const d = flagged.find((r) => r.id === "d")!;

    expect(d.isAnomaly).toBe(false);
    expect(d.averageUsage).toBeCloseTo(496.67, 1);
  });

  it("flags a reading that spikes >30% above the trailing average", () => {
    const readings = [
      reading("a", 500, 0),
      reading("b", 480, 1),
      reading("c", 510, 2),
      reading("d", 1400, 3),
    ];
    const flagged = withAnomalyFlags(readings);
    const d = flagged.find((r) => r.id === "d")!;

    expect(d.isAnomaly).toBe(true);
    expect(d.averageUsage).toBeCloseTo(496.67, 1);
  });

  it("flags a reading that drops >30% below the trailing average", () => {
    const readings = [
      reading("a", 500, 0),
      reading("b", 480, 1),
      reading("c", 510, 2),
      reading("d", 100, 3),
    ];
    const flagged = withAnomalyFlags(readings);
    const d = flagged.find((r) => r.id === "d")!;

    expect(d.isAnomaly).toBe(true);
  });

  it("only considers the trailing 3 readings, not full history", () => {
    // "outlier" would blow up the average if included, but it should have
    // rolled out of the trailing window by the time reading "e" is checked.
    const readings = [
      reading("outlier", 10000, 0),
      reading("a", 500, 1),
      reading("b", 480, 2),
      reading("c", 510, 3),
      reading("e", 505, 4),
    ];
    const flagged = withAnomalyFlags(readings);
    const e = flagged.find((r) => r.id === "e")!;

    expect(e.isAnomaly).toBe(false);
    expect(e.averageUsage).toBeCloseTo(496.67, 1);
  });

  it("keeps different utility types statistically isolated", () => {
    const readings = [
      // electricity: spikes on the 4th reading
      reading("elec-a", 500, 0, "electricity"),
      // water: stable, interleaved in input order with electricity
      reading("water-a", 100, 0, "water"),
      reading("elec-b", 480, 1, "electricity"),
      reading("water-b", 100, 1, "water"),
      reading("elec-c", 510, 2, "electricity"),
      reading("water-c", 100, 2, "water"),
      reading("elec-spike", 1400, 3, "electricity"),
      reading("water-d", 100, 3, "water"),
    ];
    const flagged = withAnomalyFlags(readings);

    expect(flagged.find((r) => r.id === "elec-spike")!.isAnomaly).toBe(true);
    expect(flagged.find((r) => r.id === "water-d")!.isAnomaly).toBe(false);
    expect(flagged.find((r) => r.id === "water-d")!.averageUsage).toBe(100);
  });

  it("sorts by periodStart internally regardless of input order", () => {
    // Same 4 readings as the spike test, but shuffled in the input array.
    const readings = [
      reading("d", 1400, 3),
      reading("b", 480, 1),
      reading("a", 500, 0),
      reading("c", 510, 2),
    ];
    const flagged = withAnomalyFlags(readings);
    const d = flagged.find((r) => r.id === "d")!;

    expect(d.isAnomaly).toBe(true);
    expect(d.averageUsage).toBeCloseTo(496.67, 1);
  });

  it("does not flag when the trailing average is zero (division-by-zero guard)", () => {
    const readings = [
      reading("a", 0, 0),
      reading("b", 0, 1),
      reading("c", 100, 2),
    ];
    const flagged = withAnomalyFlags(readings);
    const c = flagged.find((r) => r.id === "c")!;

    // A jump from 0 to 100 would normally be a clear anomaly, but the
    // deviation formula special-cases avg === 0 to avoid NaN/Infinity —
    // this test documents that current, intentional behavior.
    expect(c.averageUsage).toBe(0);
    expect(c.isAnomaly).toBe(false);
  });
});
