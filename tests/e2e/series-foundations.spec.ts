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
  await expect(page.getByRole("heading", { name: "杨坚", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /与杨坚对话/ })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "石敬瑭", exact: true })).toHaveCount(0);
});

test("new series has real paths, timeline, people and explicit placeholder map", async ({ page }) => {
  await page.goto("/series/northern-qi-zhou-sui");
  await expect(page.getByRole("heading", { name: "杨坚", exact: true })).toBeVisible();
  const paths = page.locator("#reading-paths");
  await expect(paths.getByRole("link", { name: /开始阅读/ })).toHaveCount(3);
  await paths.getByRole("link", { name: "开始阅读：杨坚怎样从北周权臣成为隋朝皇帝？" }).click();
  await expect(page.getByRole("heading", { name: "周武帝宇文邕去世", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "全部导读", exact: true })).toHaveAttribute("href", "/series/northern-qi-zhou-sui#reading-paths");
  await expect(page.getByRole("link", { name: /返回时间线/ })).toHaveAttribute("href", "/series/northern-qi-zhou-sui/timeline?year=578#timeline");
  await page.getByRole("link", { name: /下一站/ }).click();
  await expect(page.getByRole("heading", { name: "宇文赟即位，杨丽华成为皇后", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "杨丽华", exact: true }).click();
  await expect(page).toHaveURL(/\/series\/northern-qi-zhou-sui\/people/);
  await expect(page.getByRole("heading", { name: "杨丽华", exact: true })).toBeVisible();

  await page.goto("/explore/li-jingxun-death-burial?year=608&path=sui-unification-collapse");
  await expect(page.getByRole("heading", { name: "李静训去世与安葬", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await expect(page.getByRole("link", { name: /返回时间线/ })).toHaveAttribute("href", "/series/northern-qi-zhou-sui/timeline?year=608#timeline");
  await page.goto("/series/northern-qi-zhou-sui/map?year=608");
  await expect(page.getByRole("img", { name: "工程占位 geometry，不代表历史疆域" })).toBeVisible();
  await expect(page.getByRole("group", { name: "地图阶段" }).getByRole("button")).toHaveCount(7);
  await expect(page.getByText(/形状不代表真实边界/)).toBeVisible();
  await page.goto("/series/northern-qi-zhou-sui/timeline?year=608");
  await expect(page.getByRole("link", { name: /李静训去世与安葬/ }).first()).toBeVisible();
});
