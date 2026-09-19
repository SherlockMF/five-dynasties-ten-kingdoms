import { expect, test } from "@playwright/test";

test("Mock Field cases A/B/C preserve Archive discoveries through exit and reload", async ({ page }) => {
  test.skip(process.env.PLAYWRIGHT_PRODUCTION === "1" && process.env.NEXT_PUBLIC_HISTORY_FIELD_MODE !== "mock", "Production defaults to disabled");
  await page.goto("/archive/li-jingxun");
  // A fresh Playwright context keeps this isolated from a real user's records.
  await page.getByRole("link", { name: "进入现场", exact: true }).click();
  const game = page.frameLocator('iframe[title="李静训墓现场 Player"]');
  await game.getByRole("button", { name: "READY", exact: true }).click();
  await expect(game.getByLabel("INIT 数据")).toContainText("HISTORY_INIT");
  await game.getByRole("button", { name: "发现墓志 · observed", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("调查记录已更新");
  await game.getByRole("button", { name: "EXIT", exact: true }).click();
  await expect(page).toHaveURL(/\/archive\/li-jingxun$/);
  await expect(page.locator("#entry-I01")).toContainText("已观察");

  await page.reload();
  await page.getByRole("link", { name: "进入现场", exact: true }).click();
  await game.getByRole("button", { name: "READY", exact: true }).click();
  await expect(game.getByLabel("INIT 数据")).toContainText('"state": "observed"');

  await game.getByRole("button", { name: "深入记录墓志 · catalogued", exact: true }).click();
  await game.getByRole("button", { name: "发现墓志 · observed", exact: true }).click();
  await game.getByRole("button", { name: "EXIT", exact: true }).click();
  await expect(page.locator("#entry-I01")).toContainText("已完成调查");
  await page.getByRole("link", { name: "进入现场", exact: true }).click();
  await page.reload();
  await game.getByRole("button", { name: "READY", exact: true }).click();
  await expect(game.getByLabel("INIT 数据")).toContainText('"state": "catalogued"');
});
