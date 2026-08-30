import { expect, test } from "@playwright/test";

test("explores 936 from map to person to event and asks a contextual question", async ({ page }) => {
  await page.goto("/map?year=936");
  await page.getByRole("button", { name: "查看后晋" }).click();
  await expect(page.getByRole("dialog", { name: "后晋详情" })).toBeVisible();

  await page.goto("/people?year=936&person=shi-jingtang");
  await expect(page.getByRole("heading", { name: "石敬瑭" })).toBeVisible();

  await page.goto("/explore/founding-later-jin?year=936");
  await expect(page.getByRole("heading", { name: "后晋建立" })).toBeVisible();
  await page.getByRole("button", { name: "打开问史" }).click();
  await expect(page.getByText("当前上下文：936年")).toBeVisible();
});

test("primary pages never overflow the viewport", async ({ page }) => {
  for (const path of ["/", "/timeline?year=936", "/map?year=936", "/people?year=936&person=shi-jingtang", "/explore/founding-later-jin?year=936"]) {
    await page.goto(path);
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(dimensions.scrollWidth, `${path} overflows horizontally`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  }
});
