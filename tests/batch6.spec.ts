import { test, expect, type Page } from "@playwright/test";

// Batch 6: every home stop pairs with its page, and the page's last slide links back to that stop.
const PAIRS = [
  { page: "/web-embeddables", stop: "engage/embed", tab: "Web Embeddables", section: "Engage" },
  { page: "/dashboard-builder", stop: "educate/building", tab: "Building Dashboard", section: "Educate" },
  { page: "/citywide-dashboard", stop: "educate/city", tab: "Citywide Dashboard", section: "Educate" },
  { page: "/data-hub", stop: "educate/hub", tab: "Data Hub", section: "Educate" },
  { page: "/stories", stop: "educate/stories", tab: "Stories", section: "Educate" },
  { page: "/community-calendar", stop: "motivate/calendar", tab: "Community Calendar", section: "Motivate and Empower" },
  { page: "/community-voices", stop: "motivate/voices", tab: "Community Voices", section: "Motivate and Empower" },
] as const;

const settle = async (page: Page) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(800);
};

for (const pair of PAIRS) {
  test(`${pair.page}: Keep exploring links back to #${pair.stop} as Home: ${pair.section}, Who it's for and Pricing`, async ({ page }) => {
    await page.goto(`${pair.page}#keep-exploring`, { waitUntil: "load" });
    await settle(page);
    const more = page.locator("[data-keep-exploring-more]");
    await expect(more.getByRole("link", { name: `Home: ${pair.section}` })).toHaveAttribute("href", `/#${pair.stop}`);
    await expect(more.getByRole("link", { name: "Who it’s for" })).toHaveAttribute("href", "/who");
    await expect(more.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
    await more.getByRole("link", { name: `Home: ${pair.section}` }).click();
    await expect(page).toHaveURL(new RegExp(`/#${pair.stop}$`));
    await expect(page.getByRole("region", { name: pair.section }).locator(`[role="tab"][aria-selected="true"]`)).toHaveText(new RegExp(`^\\W*${pair.tab}$`));
  });
}

test("each home stop's Learn more opens its own page", async ({ page }) => {
  for (const pair of PAIRS) {
    await page.goto(`/#${pair.stop}`, { waitUntil: "load" });
    await settle(page);
    const section = page.getByRole("region", { name: pair.section });
    await expect(section.getByRole("link", { name: "Learn more" }).first()).toHaveAttribute("href", pair.page);
  }
});

test("demos Results links to the research page", async ({ page }) => {
  await page.goto("/demos#changed", { waitUntil: "load" });
  await settle(page);
  const link = page.getByRole("link", { name: "Learn more" });
  await expect(link).toHaveAttribute("href", "/research");
});

test("/dashboard-builder is the Building Dashboard page, with a real dashboard and the agreed builder capability", async ({ page }) => {
  await page.goto("/dashboard-builder", { waitUntil: "load" });
  await settle(page);
  await expect(page.getByRole("heading", { level: 1, name: "Building Dashboard" })).toBeVisible();
  await expect(page.getByText("Building Dashboard tracks and communicates patterns of real-time resource use in buildings")).toBeVisible();
  await expect(page.getByTestId("stop-dot")).toHaveCount(3);
  await expect(page.locator("iframe").first()).toHaveAttribute("src", /oc\/dashboard\/815/);
  await page.goto("/dashboard-builder#dashboard-builder", { waitUntil: "load" });
  await settle(page);
  await expect(page.getByRole("heading", {name: "Build your own dashboards"})).toBeVisible();
});

test("titles use Place – Sublocation on the demos cards and no retired call to action appears", async ({ page }) => {
  await page.goto("/demos", { waitUntil: "load" });
  await settle(page);
  await expect(page.getByText("Great Lakes Science Center – Citywide Dashboard")).toHaveCount(1);
  for (const route of ["/", "/products", "/pricing", "/who", "/demos"]) {
    await page.goto(route, { waitUntil: "load" });
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/Book a conversation|Request a quote/);
    expect(text).not.toMatch(/Midtown/);
  }
});

test("signage has one link home, named for its chapter", async ({ page }) => {
  await page.goto("/digital-signage", { waitUntil: "load" });
  await settle(page);
  const home = page.locator("a[href^='/#']");
  await expect(home).toHaveCount(1);
  await expect(home).toHaveAttribute("href", "/#engage/signage");
  await expect(home).toHaveText("Home: Engage");
});

test("Keep exploring cards on /dashboard-builder all have a picture, and none repeats the lead picture", async ({ page }) => {
  await page.goto("/dashboard-builder#keep-exploring", { waitUntil: "load" });
  await settle(page);
  const cards = page.locator("section:not([inert]) li:has(img)");
  await expect(cards).toHaveCount(3);
  const srcs = await cards.locator("img").evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).getAttribute("src")));
  expect(srcs).not.toContain("/assets/v1/Buildingdash-e1639411178404.png.webp");
  expect(new Set(srcs).size).toBe(3);
});
