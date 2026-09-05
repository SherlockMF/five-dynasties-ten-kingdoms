import { expect, test } from "@playwright/test";

test("navigation keeps the selected year and extinct polity deep links remain useful", async ({ page, isMobile }) => {
  await page.goto("/timeline?year=975");
  await expect(page.getByRole("combobox", { name: "直接选择年份" })).toHaveValue("975");
  const nav = page.getByRole("navigation", { name: isMobile ? "移动端主要导航" : "主要导航", exact: true });
  await nav.getByRole("link", { name: "地图", exact: true }).click();
  await expect(page.getByRole("slider", { name: "地图年份" })).toHaveValue("975");
  await page.goto("/map?year=978&dynasty=wuyue");
  const notice = page.getByRole("region", { name: "已选政权说明" });
  await expect(notice).toContainText("吴越");
  await expect(page).toHaveURL(/dynasty=wuyue/);
  await notice.getByRole("link", { name: "查看977年地图 →" }).click();
  await expect(page.getByRole("slider", { name: "地图年份" })).toHaveValue("977");
  await expect(page.getByRole("dialog", { name: "吴越详情" })).toBeVisible();
});

test("history modal scopes event follow-ups and restores keyboard focus", async ({ page }) => {
  await page.goto("/explore/founding-later-jin?year=936");
  const trigger = page.getByRole("button", { name: "问史 · 随时可问" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "问史助手" });
  await expect(dialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await dialog.getByRole("textbox").fill("他为什么这么做？");
  await dialog.getByRole("button", { name: "发送问题" }).click();
  await expect(dialog).toContainText("后晋建立");
  await expect(dialog).toContainText("命中证据（背景）");
  await expect(dialog.getByRole("button", { name: /基于通用历史知识/ })).toHaveCount(0);
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => ({ inside: !!document.activeElement?.closest("dialog"), tag: document.activeElement?.tagName, label: document.activeElement?.getAttribute("aria-label"), modal: document.querySelector('dialog[aria-label="问史助手"]')?.matches(":modal") })), `Tab ${i}`).toMatchObject({ inside: true });
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("opening history pauses playback", async ({ page }) => {
  await page.goto("/map?year=936");
  await page.getByRole("button", { name: "播放历史", exact: true }).click();
  await page.getByRole("button", { name: "问史 · 随时可问" }).click();
  await page.getByRole("button", { name: "关闭问史" }).click();
  await expect(page.getByRole("button", { name: "播放历史", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "暂停", exact: true })).toHaveCount(0);
});

test("aliases lead to the correct person and corrected dates disclose the source conflict", async ({ page }) => {
  await page.goto("/people");
  await page.getByRole("searchbox").fill("徐知诰");
  await page.getByRole("button", { name: "选择李昪", exact: true }).click();
  await expect(page.getByRole("heading", { name: "李昪", exact: true })).toBeVisible();
  await page.goto("/people?person=wang-pu");
  await expect(page.getByText(/906—959/)).toBeVisible();
  await expect(page.getByRole("note", { name: "异说", exact: true })).toContainText("915");
});

for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
  test(`phone ${viewport.width}: map is near the top, controls stay reachable, pages fit`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile layout matrix");
    await page.setViewportSize(viewport);
    await page.goto("/map?year=978");
    const map = page.getByTestId("atlas-map-viewport");
    await expect(map).toBeVisible();
    expect((await map.boundingBox())!.y).toBeLessThan(510);
    const slider = page.getByRole("slider", { name: "地图年份" });
    expect((await slider.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.evaluate(() => window.scrollTo({ top: 450, behavior: "instant" }));
    await expect(slider).toBeInViewport();
    expect((await slider.boundingBox())!.y).toBeGreaterThanOrEqual(64);
    await page.locator(".annual-changes > summary").click();
    await expect(page.getByRole("region", { name: "978年变化摘要" })).toBeVisible();
    for (const path of ["/", "/timeline?year=936", "/people?person=shi-jingtang", "/explore/sixteen-prefectures-ceded?year=936", "/notes"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(1);
    }
  });
}

test("phone landscape: both chat dialogs keep input and dismissal accessible", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile landscape");
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/people?person=shi-jingtang");
  await page.getByRole("button", { name: "问史 · 随时可问" }).click();
  await expect(page.getByRole("textbox", { name: "向问史提问" })).toBeInViewport();
  await expect(page.getByRole("button", { name: "关闭问史" })).toBeInViewport();
  await page.getByRole("button", { name: "关闭问史" }).click();
  await page.getByRole("button", { name: "与石敬瑭对话" }).click();
  const input = page.getByRole("textbox", { name: "对石敬瑭说" });
  await input.scrollIntoViewIfNeeded();
  await expect(input).toBeInViewport();
  await expect(page.getByRole("button", { name: "关闭对话" })).toBeInViewport();
});
