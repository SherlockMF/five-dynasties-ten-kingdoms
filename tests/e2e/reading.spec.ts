import { expect, test } from "@playwright/test";

test("production keeps historical lookup local and rejects free model chat", async ({ request }) => {
  test.skip(!process.env.CI && process.env.PLAYWRIGHT_PRODUCTION !== "1", "production server required");
  const data = { personId: "shi-jingtang", mode: "history", message: "介绍一下你的生平", history: [] };
  const history = await request.post("/api/person-chat", { data });
  expect(history.status()).toBe(200);
  expect(await history.json()).toMatchObject({ method: "local" });
  const free = await request.post("/api/person-chat", { data: { ...data, mode: "free" } });
  expect(free.status()).toBe(403);
  expect(await free.json()).toMatchObject({ code: "CHAT_LOCAL_ONLY" });
});

test("reads a complete guided path and returns to the home choices", async ({ page }) => {
  await page.goto("/#reading-paths");
  await page.getByRole("link", { name: "开始阅读：五代如何更替" }).click();
  const navigation = page.getByRole("navigation", { name: "主题导读" });
  await expect(navigation).toContainText("第 1 / 6 站");
  await expect(page.getByRole("heading", { name: "史料怎么说" })).toBeVisible();
  await expect(page.getByRole("link", { name: /查看原文与上下文/ })).toHaveAttribute("href", /卷266/);
  for (let station = 2; station <= 6; station++) {
    await navigation.getByRole("link", { name: /下一站/ }).click();
    await expect(navigation).toContainText(`第 ${station} / 6 站`);
  }
  await expect(navigation).toContainText("本条导读已读到最后一站");
  await navigation.getByRole("link", { name: "全部导读" }).click();
  await expect(page.getByRole("heading", { name: "不必先记住每一个年份" })).toBeVisible();
});

test("moves from a person's life to the event and annual map comparison", async ({ page, isMobile }) => {
  await page.goto("/people?year=936&person=shi-jingtang");
  const life = page.getByRole("region", { name: "石敬瑭的生平事件" });
  await life.getByRole("link", { name: "后晋建立", exact: true }).click();
  await expect(page.getByRole("heading", { name: "后晋建立", exact: true })).toBeVisible();
  await page.goBack();
  await life.getByRole("link", { name: "在地图查看后晋建立" }).click();
  await expect(page).toHaveURL(/\/map\?year=936/);
  await page.getByRole("button", { name: /^太原：(?=.*后晋建立)/ }).click();
  const closeEvent = page.getByRole("button", { name: /关闭.*事件/ });
  await expect(closeEvent).toBeVisible();
  await closeEvent.click();
  if (isMobile) await page.locator(".annual-changes > summary").click();
  const summary = page.getByRole("region", { name: "936年变化摘要" });
  await expect(summary).toContainText("935 → 936");
  await expect(summary).toContainText("燕云");
  await expect(summary.getByRole("link", { name: "后晋建立", exact: true })).toBeVisible();
});

test("new reading sections fit the viewport", async ({ page }) => {
  for (const path of ["/#reading-paths", "/people?person=shi-jingtang", "/explore/chenqiao-mutiny?path=five-dynasties", "/map?year=978"]) {
    await page.goto(path);
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(dimensions.scroll, path).toBeLessThanOrEqual(dimensions.width + 1);
  }
});
