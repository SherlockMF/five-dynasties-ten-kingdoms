import { expect, test } from "@playwright/test";

test("explores 936 from map to person to event and asks a contextual question", async ({ page }) => {
  await page.goto("/map?year=936");
  await page.getByRole("button", { name: "查看后晋" }).click();
  const dynastyDialog = page.getByRole("dialog", { name: "后晋详情" });
  await expect(dynastyDialog).toBeVisible();
  await expect(dynastyDialog.getByText("当年君主（年内）")).toBeVisible();
  await expect(dynastyDialog.getByRole("link", { name: "石敬瑭", exact: true })).toHaveAttribute(
    "href",
    "/people?year=936&person=shi-jingtang",
  );

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
    name: /^太原：(?=.*石敬瑭起兵)(?=.*契丹援石敬瑭)(?=.*后晋建立)/,
  });
  await expect(marker).toBeVisible();

  async function expectProjectedAlignment() {
    await expect
      .poll(async () => marker.evaluate((button) => {
        const anchor = button.parentElement;
        const layer = anchor?.parentElement;
        const svg = layer?.previousElementSibling as SVGSVGElement | null;
        if (!anchor || !layer || !svg) throw new Error("map marker structure missing");
        const anchorBox = anchor.getBoundingClientRect();
        const svgBox = svg.getBoundingClientRect();
        const mapX = Number(anchor.dataset.mapX);
        const mapY = Number(anchor.dataset.mapY);
        const scale = Math.min(svgBox.width / 800, svgBox.height / 500);
        const expectedX = svgBox.left + (svgBox.width - 800 * scale) / 2 + mapX * scale;
        const expectedY = svgBox.top + (svgBox.height - 500 * scale) / 2 + mapY * scale;
        return Math.max(
          Math.abs(anchorBox.left - expectedX),
          Math.abs(anchorBox.top - expectedY),
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
    "/explore/shi-jingtang-rebellion?year=936&event=shi-jingtang-rebellion",
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
  await dialog.getByRole("link", { name: "石敬瑭起兵（太原）" }).click();
  await expect(page).toHaveURL(
    /\/explore\/shi-jingtang-rebellion\?year=936&event=shi-jingtang-rebellion$/,
  );
  await expect(page.getByRole("heading", { name: "石敬瑭起兵（太原）" })).toBeVisible();
});

test("mobile map event markers keep separate full-size touch targets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile touch geometry");
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto("/map?year=936");

  const markers = page.locator("[data-event-marker]");
  await expect(markers.first()).toBeVisible();
  expect(await markers.count()).toBeGreaterThan(1);
  await expect
    .poll(async () =>
      markers.evaluateAll((buttons) => {
        const boxes = buttons.map((button) => button.getBoundingClientRect());
        return boxes.reduce(
          (overlaps, a, first) =>
            overlaps +
            boxes.slice(first + 1).filter(
              (b) =>
                a.x < b.x + b.width &&
                a.x + a.width > b.x &&
                a.y < b.y + b.height &&
                a.y + a.height > b.y,
            ).length,
          0,
        );
      }),
    )
    .toBe(0);
  const targets = await markers.evaluateAll((buttons) =>
    buttons.map((button) => {
      const box = button.getBoundingClientRect();
      return {
        name: button.getAttribute("aria-label"),
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        clipPath: getComputedStyle(button).clipPath,
      };
    }),
  );
  for (const target of targets) {
    expect(target.width, target.name ?? "marker").toBeGreaterThanOrEqual(44);
    expect(target.height, target.name ?? "marker").toBeGreaterThanOrEqual(44);
    expect(target.clipPath, target.name ?? "marker").toBe("none");
  }
  for (let first = 0; first < targets.length; first += 1) {
    for (let second = first + 1; second < targets.length; second += 1) {
      const a = targets[first];
      const b = targets[second];
      const overlaps =
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
      expect(overlaps, `${a.name} overlaps ${b.name}`).toBe(false);
    }
  }

  const taiyuan = page.getByRole("button", {
    name: /^太原：(?=.*石敬瑭起兵)(?=.*契丹援石敬瑭)(?=.*后晋建立)/,
  });
  await taiyuan.tap();
  await expect(page.getByRole("dialog", { name: "太原事件" })).toBeVisible();
  await page.getByRole("button", { name: "关闭太原事件" }).click();
  const youzhou = page.getByRole("button", {
    name: "幽州：燕云十六州归辽（时称契丹）",
  });
  await youzhou.tap();
  await expect(page.getByRole("dialog", { name: "幽州事件" })).toBeVisible();
});

test("map event dialog traps real keyboard focus and restores its trigger", async ({ page }) => {
  await page.goto("/map?year=936");
  const marker = page.getByRole("button", {
    name: /^太原：(?=.*石敬瑭起兵)(?=.*契丹援石敬瑭)(?=.*后晋建立)/,
  });
  await marker.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "太原事件" });
  const close = dialog.getByRole("button", { name: "关闭太原事件" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("note", { name: "第04集主线、史料扩展" }).last(),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(marker).toBeFocused();
  await expect(page).not.toHaveURL(/(?:\?|&)event=/);
});

test("mobile map popover recomputes its viewport placement after rotation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile rotation geometry");
  const sizes = [
    { width: 412, height: 915 },
    { width: 915, height: 412 },
    { width: 412, height: 915 },
  ];
  await page.setViewportSize(sizes[0]);
  await page.goto("/map?year=936");
  const marker = page.getByRole("button", {
    name: "幽州：燕云十六州归辽（时称契丹）",
  });
  await marker.tap();
  const dialog = page.getByRole("dialog", { name: "幽州事件" });

  for (const size of sizes) {
    await page.setViewportSize(size);
    await expect(dialog).toBeVisible();
    await expect
      .poll(async () => {
        const box = await dialog.boundingBox();
        if (!box) return false;
        return (
          box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= size.width &&
          box.y + box.height <= size.height
        );
      })
      .toBe(true);
    const markerBox = await marker.boundingBox();
    expect(markerBox).not.toBeNull();
    expect(markerBox!.width).toBeGreaterThanOrEqual(44);
    expect(markerBox!.height).toBeGreaterThanOrEqual(44);

    const markerBoxes = await page.locator("[data-event-marker]").evaluateAll(
      (buttons) =>
        buttons.map((button) => {
          const box = button.getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width, height: box.height };
        }),
    );
    for (let first = 0; first < markerBoxes.length; first += 1) {
      for (let second = first + 1; second < markerBoxes.length; second += 1) {
        const a = markerBoxes[first];
        const b = markerBoxes[second];
        expect(
          a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y,
        ).toBe(false);
      }
    }
  }

  await dialog.getByRole("button", { name: "关闭幽州事件" }).click();
  const taiyuan = page.getByRole("button", {
    name: /^太原：(?=.*石敬瑭起兵)(?=.*契丹援石敬瑭)(?=.*后晋建立)/,
  });
  await taiyuan.tap();
  await expect(page.getByRole("dialog", { name: "太原事件" })).toBeVisible();
});

test("map event modal is a top-level inert and accessible portal", async (
  { context, page },
  testInfo,
) => {
  const viewport = testInfo.project.name === "mobile"
    ? { width: 412, height: 915 }
    : { width: 1280, height: 800 };
  await page.setViewportSize(viewport);
  await page.goto("/map?year=936");
  const taiyuan = page.getByRole("button", {
    name: /^太原：(?=.*石敬瑭起兵)(?=.*契丹援石敬瑭)(?=.*后晋建立)/,
  });
  const youzhou = page.getByRole("button", {
    name: "幽州：燕云十六州归辽（时称契丹）",
  });
  const slider = page.getByRole("slider", { name: "地图年份" });
  const backgroundLink = testInfo.project.name === "mobile"
    ? page
        .getByRole("navigation", { name: "移动端主要导航" })
        .getByRole("link", { name: "首页" })
    : page.getByRole("link", { name: "五代十国互动历史探索首页" });

  await taiyuan.click();
  const taiyuanAccessibleName = await taiyuan.getAttribute("aria-label");
  const taiyuanDialog = page.getByRole("dialog", { name: "太原事件" });
  const backdrop = page.getByTestId("map-modal-backdrop");
  await expect(taiyuanDialog).toBeVisible();
  await expect(backdrop).toBeVisible();
  await expect(youzhou).toBeDisabled();
  const backdropBox = await backdrop.boundingBox();
  expect(backdropBox).toEqual({ x: 0, y: 0, ...viewport });
  expect(
    await backdrop.evaluate((element) => Number(getComputedStyle(element).zIndex)),
  ).toBeGreaterThan(50);
  expect(
    await taiyuanDialog.evaluate((dialog) =>
      dialog.parentElement?.matches("[data-map-event-modal-host]"),
    ),
  ).toBe(true);
  expect(
    await page.locator("body > :not([data-map-event-modal-host])").evaluateAll(
      (elements) => elements.every((element) => (element as HTMLElement).inert),
    ),
  ).toBe(true);

  for (const backgroundControl of [backgroundLink, slider, youzhou]) {
    await expect(backgroundControl).toBeVisible();
    expect(
      await backgroundControl.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const hit = document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        );
        return hit !== element && !element.contains(hit);
      }),
    ).toBe(true);
  }

  const close = taiyuanDialog.getByRole("button", { name: "关闭太原事件" });
  await expect(close).toBeFocused();
  await slider.evaluate((element) => (element as HTMLElement).focus());
  await expect(close).toBeFocused();
  const sourceMarker = taiyuanDialog
    .getByRole("note", { name: "第04集主线、史料扩展" })
    .first();
  await sourceMarker.focus();
  await expect(
    taiyuanDialog.getByRole("tooltip", { includeHidden: true }).first(),
  ).toBeVisible();

  const client = await context.newCDPSession(page);
  const axTree = await client.send("Accessibility.getFullAXTree");
  for (const foregroundName of [
    "太原事件",
    "关闭太原事件",
    "石敬瑭起兵（太原）",
    "第04集主线、史料扩展",
  ]) {
    expect(
      axTree.nodes.some(
        (node) => !node.ignored && node.name?.value === foregroundName,
      ),
      `${foregroundName} should remain in the accessibility tree`,
    ).toBe(true);
  }
  for (const backgroundName of [
    "地图年份",
    taiyuanAccessibleName,
    testInfo.project.name === "mobile"
      ? "首页"
      : "五代十国互动历史探索首页",
  ]) {
    expect(
      axTree.nodes.some(
        (node) => !node.ignored && node.name?.value === backgroundName,
      ),
      `${backgroundName} should be ignored while inert`,
    ).toBe(false);
  }

  const youzhouBox = await youzhou.boundingBox();
  expect(youzhouBox).not.toBeNull();
  await page.mouse.click(
    youzhouBox!.x + youzhouBox!.width / 2,
    youzhouBox!.y + youzhouBox!.height / 2,
  );
  await expect(page.getByRole("dialog", { name: "幽州事件" })).toBeHidden();
  if (await taiyuanDialog.isVisible()) {
    await taiyuanDialog.getByRole("button", { name: "关闭太原事件" }).click();
  }

  await youzhou.click();
  await expect(page.getByRole("dialog", { name: "幽州事件" })).toBeVisible();
  await page.keyboard.press("Escape");
  await taiyuan.click();
  const sliderBox = await slider.boundingBox();
  expect(sliderBox).not.toBeNull();
  await page.mouse.click(
    sliderBox!.x + sliderBox!.width - 4,
    sliderBox!.y + sliderBox!.height / 2,
  );
  await expect(taiyuanDialog).toBeHidden();
  await expect(slider).toHaveValue("936");
});

test("a disappearing event selection closes permanently with a safe focus target", async ({ page }) => {
  await page.goto("/map?year=936");
  const slider = page.getByRole("slider", { name: "地图年份" });
  const marker = page.getByRole("button", {
    name: /^太原：(?=.*石敬瑭起兵)(?=.*契丹援石敬瑭)(?=.*后晋建立)/,
  });
  await marker.click();
  await expect(page).toHaveURL(/(?:\?|&)event=founding-later-jin(?:&|$)/);
  const dialog = page.getByRole("dialog", { name: "太原事件" });
  const close = dialog.getByRole("button", { name: "关闭太原事件" });
  await slider.evaluate((element) => (element as HTMLElement).focus());
  await expect(close).toBeFocused();
  await slider.evaluate((element) => {
    const input = element as HTMLInputElement;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(input, "937");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(slider).toHaveValue("937");
  await expect(dialog).toBeHidden();
  await expect(page).not.toHaveURL(/(?:\?|&)event=/);
  await expect(page.getByLabel("937年地图事件")).toBeFocused();
  await slider.evaluate((element) => {
    const input = element as HTMLInputElement;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(input, "936");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(slider).toHaveValue("936");
  await expect(dialog).toBeHidden();
  await expect(page).not.toHaveURL(/(?:\?|&)event=/);

  await marker.click();
  await page.getByRole("button", { name: "播放历史" }).evaluate((button) =>
    (button as HTMLButtonElement).click(),
  );
  await expect(slider).toHaveValue("937", { timeout: 3_000 });
  await expect(dialog).toBeHidden();
  await expect(page.getByLabel("937年地图事件")).toBeFocused();
  await page.getByRole("button", { name: "暂停" }).evaluate((button) =>
    (button as HTMLButtonElement).click(),
  );
  await page.keyboard.press("ArrowLeft");
  await expect(dialog).toBeHidden();
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
