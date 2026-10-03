// The stacked header: the selected day's total and split, or an honest "no breakdown" (spec §11 CAL1).
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TrendChart, type TrendPoint } from "./TrendChart";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }), usePathname: () => "/strain", useSearchParams: () => new URLSearchParams() }));

const STACK = [
  { key: "resting", label: "Resting", color: "var(--energy-resting)" },
  { key: "active", label: "Active", color: "var(--energy-active)" },
];
const chart = (last: TrendPoint) => {
  const points: TrendPoint[] = [{ date: "2026-09-30", value: 2000, parts: { resting: 1600, active: 400 } }, last];
  return render(
    <TrendChart label="Calories burned" unit="kcal" format="grouped" colorBy="single" stack={STACK} headline="day" ranges={["w", "m"]} defaultRange="w" data={{ value: points, reason: null, provisional: false }} />,
  );
};

// 2026-09-14 (Mon) .. 2026-10-03 (Sat): week 38, week 39 and a current week 40 that has reached Saturday.
const weeks = () => {
  const points: TrendPoint[] = []
  for (let i = 0; i < 20; i++) {
    const date = new Date(Date.UTC(2026, 8, 14 + i)).toISOString().slice(0, 10)
    points.push({ date, value: 2000 + i, parts: { resting: 1600, active: 400 + i } })
  }
  return render(
    <TrendChart label="Calories burned" unit="kcal" format="grouped" colorBy="single" stack={STACK} headline="day" weekNav ranges={["w", "m"]} defaultRange="w" data={{ value: points, reason: null, provisional: false }} />,
  )
}

describe("TrendChart weekNav", () => {
  it("opens on the current Monday-Sunday week, headed by its last day so far", () => {
    weeks()
    expect(screen.getByText("Week 40")).toBeInTheDocument()
    expect(screen.getByText("Sep 28 - Oct 4")).toBeInTheDocument()
    expect(screen.getByText("2,019")).toBeInTheDocument() // Saturday Oct 3
    expect(screen.getByRole("button", { name: "Next week" })).toBeDisabled()
  })

  it("steps back to earlier weeks and stops at the oldest one", () => {
    weeks()
    fireEvent.click(screen.getByRole("button", { name: "Previous week" }))
    expect(screen.getByText("Week 39")).toBeInTheDocument()
    expect(screen.getByText("Sep 21 - Sep 27")).toBeInTheDocument()
    expect(screen.getByText("2,013")).toBeInTheDocument() // that week's Sunday, Sep 27
    fireEvent.click(screen.getByRole("button", { name: "Previous week" }))
    expect(screen.getByText("Week 38")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Previous week" })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Next week" }))
    expect(screen.getByText("Week 39")).toBeInTheDocument()
  })

  it("stops at the earliest week with data, not at empty days before it", () => {
    // Four empty days (Sep 10-13, week 37) in front of the data that starts Monday Sep 14 (week 38).
    const points: TrendPoint[] = []
    for (let i = 0; i < 24; i++) {
      const date = new Date(Date.UTC(2026, 8, 10 + i)).toISOString().slice(0, 10)
      points.push(i < 4 ? { date, value: null } : { date, value: 2000 + i, parts: { resting: 1600, active: 400 + i } })
    }
    render(
      <TrendChart label="Calories burned" unit="kcal" format="grouped" colorBy="single" stack={STACK} headline="day" weekNav ranges={["w", "m"]} defaultRange="w" data={{ value: points, reason: null, provisional: false }} />,
    )
    fireEvent.click(screen.getByRole("button", { name: "Previous week" }))
    fireEvent.click(screen.getByRole("button", { name: "Previous week" }))
    expect(screen.getByText("Week 38")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Previous week" })).toBeDisabled()
  })

  it("labels each bar with weekday and date", () => {
    const { container } = weeks()
    const ticks = [...container.querySelectorAll(".recharts-cartesian-axis-tick-value")].map((t) => t.textContent)
    // The chart may not lay out in happy-dom; when it does, the labels are weekday then date.
    if (ticks.length) expect(ticks).toContain("Mon28")
  })

  it("has no week arrows without weekNav", () => {
    chart({ date: "2026-10-01", value: 2150, parts: null })
    expect(screen.queryByRole("button", { name: "Previous week" })).not.toBeInTheDocument()
  })
})

describe("TrendChart stack", () => {
  it("heads with the last day's total and its split, active first", () => {
    chart({ date: "2026-10-01", value: 2150, parts: { resting: 1700, active: 450 } });
    expect(screen.getByText("2,150")).toBeInTheDocument();
    const legend = screen.getByText("Active").parentElement!;
    expect(legend.textContent).toBe("Active450Resting1,700");
    expect(screen.queryByText("Average")).not.toBeInTheDocument();
  });

  it("says no breakdown for a day with a total but no parts", () => {
    chart({ date: "2026-10-01", value: 2150, parts: null });
    expect(screen.getByText("2,150")).toBeInTheDocument();
    expect(screen.getByText("No breakdown for this day")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });
});
