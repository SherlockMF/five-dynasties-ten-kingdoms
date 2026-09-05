import { expect, test } from "@playwright/test";

test("many event locations do not push the title or content down", async ({ page, isMobile }) => {
  await page.goto("/explore/sixteen-prefectures-ceded?year=936");
  const header = page.locator("article > header");
  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toBeVisible();
  const headerBox = await header.boundingBox();
  const titleBox = await title.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(headerBox!.height).toBeGreaterThan(0);
  expect(titleBox!.y - headerBox!.y).toBeLessThan(350);
  expect(headerBox!.height).toBeLessThan(isMobile ? 1100 : 650);
  const locations = page.getByRole("region", { name: "事件地点，共 16 处" });
  await expect(locations.getByRole("listitem")).toHaveCount(16);
  const list = locations.getByRole("list");
  await list.focus();
  await page.keyboard.press("End");
  await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect(locations.getByText("蔚州", { exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
