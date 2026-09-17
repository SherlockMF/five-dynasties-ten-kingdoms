import { expect, test } from "@playwright/test";

test("series entry routes and people remain isolated", async ({ page }) => {
  for (const path of ["/", "/series/five-dynasties", "/series/northern-qi-zhou-sui"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await page.goto("/series/five-dynasties/people");
  await expect(page.getByRole("heading", { name: "石敬瑭", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "十国人物", exact: true }).click();
  const candidates = page.getByRole("region", { name: "候选人物" });
  await expect(candidates.getByText("李煜", { exact: true })).toBeVisible();
  await expect(candidates.getByText("石敬瑭", { exact: true })).toHaveCount(0);
  const response = await page.goto("/series/northern-qi-zhou-sui/people");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("status")).toHaveText("人物资料待核验入库。");
  await expect(page.getByRole("heading", { name: "石敬瑭", exact: true })).toHaveCount(0);
});
