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

test("map event markers stay projected and expose a bounded sourced popover", async ({ page }) => {
  await page.goto("/map?year=936");
  const marker = page.getByRole("button", {
    name: "太原：石敬瑭起兵、契丹援石敬瑭、后晋建立",
  });
  await expect(marker).toBeVisible();

  async function expectProjectedAlignment() {
    await expect
      .poll(async () => marker.evaluate((button) => {
        const anchor = button.parentElement;
        const layer = anchor?.parentElement;
        const svg = layer?.previousElementSibling as SVGSVGElement | null;
        if (!anchor || !layer || !svg) throw new Error("map marker structure missing");
        const markerBox = button.getBoundingClientRect();
        const svgBox = svg.getBoundingClientRect();
        const mapX = Number(anchor.dataset.mapX);
        const mapY = Number(anchor.dataset.mapY);
        const scale = Math.min(svgBox.width / 800, svgBox.height / 500);
        const expectedX = svgBox.left + (svgBox.width - 800 * scale) / 2 + mapX * scale;
        const expectedY = svgBox.top + (svgBox.height - 500 * scale) / 2 + mapY * scale;
        return Math.max(
          Math.abs(markerBox.left + markerBox.width / 2 - expectedX),
          Math.abs(markerBox.top + markerBox.height / 2 - expectedY),
        );
      }))
      .toBeLessThanOrEqual(2);
  }

  await expectProjectedAlignment();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(marker).toBeVisible();
  await expectProjectedAlignment();

  await marker.click();
  const dialog = page.getByRole("dialog", { name: "太原事件" });
  await expect(dialog.getByRole("link", { name: "石敬瑭起兵（太原）" })).toHaveAttribute(
    "href",
    "/explore/shi-jingtang-rebellion?year=936",
  );
  await expect(
    dialog.getByRole("note", { name: "第04集主线、史料扩展" }).first(),
  ).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(dialogBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.y).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(viewport!.width);
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(viewport!.height);
});

test("map corrects pre-907 years without dropping existing query state", async ({ page }) => {
  await page.goto("/map?year=884&dynasty=later-jin");

  await expect(page.getByRole("status")).toHaveText(
    "地图仅展示907—979年，已校正为907年",
  );
  await expect(page).toHaveURL(/\/map\?year=907&dynasty=later-jin$/);
  await expect(page.getByText(/^907 · 年末格局/)).toBeVisible();
});

test("primary pages never overflow the viewport", async ({ page }) => {
  for (const path of ["/", "/timeline?year=936", "/map?year=936", "/people?year=936&person=shi-jingtang", "/explore/founding-later-jin?year=936"]) {
    await page.goto(path);
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(dimensions.scrollWidth, `${path} overflows horizontally`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  }
});

test("timeline source markers expose a usable browser tooltip", async (
  { context, page },
  testInfo,
) => {
  const label = "第04集主线、史料扩展";
  await page.goto("/timeline?year=936");

  const article = page
    .getByRole("article")
    .filter({ has: page.getByRole("link", { name: "查看后晋建立详情" }) });
  const detailLink = article.getByRole("link", { name: "查看后晋建立详情" });
  const trigger = article.getByLabel(label);
  const tooltip = article.getByRole("tooltip", { includeHidden: true });

  const triggerBox = await trigger.boundingBox();
  const triggerLineHeight = await trigger.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).lineHeight),
  );
  expect(triggerBox).not.toBeNull();
  expect(triggerLineHeight).toBeGreaterThan(0);
  expect(triggerBox!.height).toBeGreaterThanOrEqual(24);
  expect(triggerBox!.width).toBeGreaterThanOrEqual(24);
  await expect(trigger).toHaveAccessibleName(label);

  const tooltipId = await tooltip.getAttribute("id");
  expect(tooltipId).toBeTruthy();
  await expect(trigger).toHaveAttribute("aria-controls", tooltipId!);
  expect(
    await tooltip.locator("a, button, input, [tabindex]").count(),
  ).toBe(0);
  await expect(tooltip).toHaveCSS("position", "absolute");
  await expect(tooltip).toHaveCSS("visibility", "hidden");
  await expect(tooltip).toHaveCSS("opacity", "0");

  if (testInfo.project.name === "mobile") {
    await trigger.tap();
  } else {
    await trigger.hover();
  }
  await expect(tooltip).toHaveCSS("visibility", "visible");
  await expect(tooltip).toHaveCSS("opacity", "1");

  const tooltipBox = await tooltip.boundingBox();
  const viewport = page.viewportSize();
  expect(tooltipBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(tooltipBox!.x).toBeGreaterThanOrEqual(0);
  expect(tooltipBox!.y).toBeGreaterThanOrEqual(0);
  expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(
    viewport!.width,
  );
  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(
    viewport!.height,
  );

  if (testInfo.project.name !== "mobile") {
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCSS("visibility", "hidden");
    await detailLink.focus();
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await expect(tooltip).toHaveCSS("visibility", "visible");
    await page.keyboard.press("Tab");
    await expect(tooltip).toHaveCSS("visibility", "hidden");
  }

  const client = await context.newCDPSession(page);
  const axTree = await client.send("Accessibility.getFullAXTree");
  expect(
    axTree.nodes.some(
      (node) => !node.ignored && node.name?.value === label,
    ),
  ).toBe(true);

  await detailLink.click();
  await expect(page).toHaveURL(/\/explore\/founding-later-jin\?year=936$/);
});

test("inverse source markers retain their legend and mobile focus behavior", async (
  { page },
  testInfo,
) => {
  const label = "第03、04、05集主线、史料扩展";
  await page.goto("/people?year=936&person=shi-jingtang");

  const panel = page.getByRole("region", { name: "石敬瑭" });
  const trigger = panel.getByRole("note", { name: label });
  const tooltip = panel.getByRole("tooltip", { includeHidden: true });
  await expect(
    panel.getByText("¹ 六集主线 · ² 史料扩展 · ³ 存在异说"),
  ).toBeVisible();

  const triggerBox = await trigger.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(triggerBox!.height).toBeGreaterThanOrEqual(24);
  expect(triggerBox!.width).toBeGreaterThanOrEqual(24);

  if (testInfo.project.name === "mobile") {
    await trigger.tap();
  } else {
    await trigger.focus();
  }
  await expect(tooltip).toHaveCSS("visibility", "visible");
  await expect(tooltip).toHaveCSS("opacity", "1");
  await expect(tooltip).toHaveCSS("background-color", "rgb(243, 240, 231)");
  await expect(tooltip).toHaveCSS("color", "rgb(23, 40, 36)");

  const tooltipBox = await tooltip.boundingBox();
  const viewport = page.viewportSize();
  expect(tooltipBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(tooltipBox!.x).toBeGreaterThanOrEqual(0);
  expect(tooltipBox!.y).toBeGreaterThanOrEqual(0);
  expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(
    viewport!.width,
  );
  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(
    viewport!.height,
  );

  await trigger.evaluate((element) => (element as HTMLElement).blur());
  await expect(tooltip).toHaveCSS("visibility", "hidden");
});

test("timeline source markers flip above at the viewport bottom", async (
  { page },
  testInfo,
) => {
  const label = "第04集主线、史料扩展";
  await page.goto("/timeline?year=936");

  const article = page
    .getByRole("article")
    .filter({ has: page.getByRole("link", { name: "查看后晋建立详情" }) });
  const trigger = article.getByRole("note", { name: label });
  const tooltip = article.getByRole("tooltip", { includeHidden: true });

  await trigger.evaluate((element) => {
    document.documentElement.style.scrollBehavior = "auto";
    const box = element.getBoundingClientRect();
    window.scrollBy(0, box.bottom - window.innerHeight + 8);
  });

  const triggerBox = await trigger.boundingBox();
  const viewport = page.viewportSize();
  expect(triggerBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(triggerBox!.y + triggerBox!.height).toBeGreaterThan(
    viewport!.height - 16,
  );

  if (testInfo.project.name === "mobile") {
    await trigger.evaluate((element) =>
      (element as HTMLElement).focus({ preventScroll: true }),
    );
  } else {
    await page.mouse.move(
      triggerBox!.x + triggerBox!.width / 2,
      triggerBox!.y + triggerBox!.height / 2,
    );
  }

  await expect(tooltip).toHaveCSS("visibility", "visible");
  await expect(tooltip).toHaveCSS("opacity", "1");
  const visibleTriggerBox = await trigger.boundingBox();
  const tooltipBox = await tooltip.boundingBox();
  expect(visibleTriggerBox).not.toBeNull();
  expect(tooltipBox).not.toBeNull();
  expect(tooltipBox!.y).toBeGreaterThanOrEqual(0);
  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(
    viewport!.height,
  );
  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(
    visibleTriggerBox!.y,
  );
});

test("inverse source markers flip above at the viewport bottom", async ({
  page,
}) => {
  const label = "第03、04、05集主线、史料扩展";
  await page.goto("/people?year=936&person=shi-jingtang");

  const panel = page.getByRole("region", { name: "石敬瑭" });
  const trigger = panel.getByRole("note", { name: label });
  const tooltip = panel.getByRole("tooltip", { includeHidden: true });
  await trigger.evaluate((element) => {
    document.documentElement.style.scrollBehavior = "auto";
    const box = element.getBoundingClientRect();
    window.scrollBy(0, box.bottom - window.innerHeight + 8);
  });

  const triggerBox = await trigger.boundingBox();
  const viewport = page.viewportSize();
  expect(triggerBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(triggerBox!.y + triggerBox!.height).toBeGreaterThan(
    viewport!.height - 16,
  );

  await trigger.evaluate((element) =>
    (element as HTMLElement).focus({ preventScroll: true }),
  );
  await expect(tooltip).toHaveCSS("visibility", "visible");
  await expect(tooltip).toHaveCSS("opacity", "1");
  const visibleTriggerBox = await trigger.boundingBox();
  const tooltipBox = await tooltip.boundingBox();
  expect(visibleTriggerBox).not.toBeNull();
  expect(tooltipBox).not.toBeNull();
  expect(tooltipBox!.y).toBeGreaterThanOrEqual(0);
  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(
    viewport!.height,
  );
  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(
    visibleTriggerBox!.y,
  );

  await trigger.evaluate((element) => (element as HTMLElement).blur());
  await expect(tooltip).toHaveCSS("visibility", "hidden");
});
