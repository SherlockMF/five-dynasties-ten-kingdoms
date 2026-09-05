import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DynastyListView } from "@/features/history-map/dynasty-list-view";
import { DynastyPopover } from "@/features/history-map/dynasty-popover";
import { withMapPolities } from "@/features/history-map/atlas/map-polities";

describe("fixed regional context", () => {
  const tibet = withMapPolities([]).find((p) => p.id === "tibetan-regions")!;
  it("does not present the display interval as a background polity lifespan", () => {
    render(<DynastyListView dynasties={[tibet]} regions={[]} year={943} onSelect={() => {}} />);
    expect(screen.getByText("地域背景 · 非逐年控制面")).toBeInTheDocument();
    expect(screen.queryByText("907—979")).not.toBeInTheDocument();
    expect(screen.queryByText(/当年君主/)).not.toBeInTheDocument();
  });
  it("explains context in the fixed detail header", () => {
    render(<DynastyPopover dynasty={tibet} regions={[]} events={[]} year={943} onClose={() => {}} />);
    expect(screen.getByTestId("dynasty-profile-header")).toHaveTextContent("943总图地域背景");
    expect(screen.queryByRole("heading", {name:"年末君主"})).not.toBeInTheDocument();
  });
});
