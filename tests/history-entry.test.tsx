import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/layout/site-header";
import { AiDrawer } from "@/features/ai/ai-drawer";
import { useHistoryStore } from "@/features/history-state/history-store";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("history entry points", () => {
  beforeEach(() => useHistoryStore.getState().reset({ currentYear: 936 }));

  it("keeps only the header entry and opens and closes the drawer", async () => {
    const user = userEvent.setup();
    render(<><SiteHeader /><AiDrawer /></>);
    expect(screen.queryByRole("button", { name: "打开问史" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "问史 · 随时可问" }));
    expect(screen.getByRole("dialog", { name: "问史助手" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "向问史提问" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "关闭问史" }));
    expect(screen.queryByRole("dialog", { name: "问史助手" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "问史 · 随时可问" })).toHaveAttribute("aria-expanded", "false");
  });
});
