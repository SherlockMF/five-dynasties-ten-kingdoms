import { afterEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("server-only", () => ({}));
const route = vi.hoisted(() => ({ pathname: "/field/li-jingxun" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname, notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("@/components/layout/site-header", () => ({ SiteHeader: () => <div>历史导航</div> }));
vi.mock("@/components/layout/mobile-nav", () => ({ MobileNav: () => <div>移动导航</div> }));
vi.mock("@/features/ai/ai-drawer", () => ({ AiDrawer: () => <div>问史</div> }));
import MockPage from "@/app/field/mock/li-jingxun/page";
import FieldPage from "@/app/field/li-jingxun/page";
import { SiteChrome } from "@/components/layout/site-chrome";

afterEach(() => vi.unstubAllEnvs());
it("fails closed in production and hides the mock endpoint unless explicitly enabled", () => {
  vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("NEXT_PUBLIC_HISTORY_FIELD_MODE", "");
  expect(FieldPage().props.config.mode).toBe("disabled");
  expect(() => MockPage()).toThrow("NOT_FOUND");
  vi.stubEnv("NEXT_PUBLIC_HISTORY_FIELD_MODE", "mock");
  expect(MockPage()).toBeTruthy();
});
it("isolates both Field pages from historical navigation without affecting Five Dynasties", () => {
  for (const pathname of ["/field/li-jingxun", "/field/mock/li-jingxun"]) {
    route.pathname = pathname;
    const result = render(<SiteChrome><p>Player</p></SiteChrome>);
    expect(screen.queryByText("历史导航")).not.toBeInTheDocument();
    expect(screen.queryByText("问史")).not.toBeInTheDocument();
    result.unmount();
  }
  route.pathname = "/map";
  render(<SiteChrome><p>年度地图</p></SiteChrome>);
  expect(screen.getByText("历史导航")).toBeVisible();
  expect(screen.getByText("问史")).toBeVisible();
});
