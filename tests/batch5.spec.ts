import { test, expect } from "@playwright/test";

const BANNED = /Toledo|Doughnut|AASHE|Hamilton/;

async function text(page: import("@playwright/test").Page, route: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route, { waitUntil: "load" });
  return page.locator("body").innerText();
}

test("/toolkit lists the 35 sourced lessons, each linking out, with the credit line", async ({ page }) => {
  const body = await text(page, "/toolkit");
  await expect(page.getByRole("heading", { level: 1, name: "Teacher toolkit" })).toBeVisible();
  await expect(page.locator("[data-lesson]")).toHaveCount(35);
  const hrefs = await page.locator("[data-lesson] a").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
  expect(hrefs).toHaveLength(35);
  for (const h of hrefs) expect(h).toMatch(/^https:\/\/environmentaldashboard\.org\//);
  await expect(page.getByRole("link", { name: /Environmental Dashboard Instructor Toolkit/ })).toHaveAttribute("href", "https://environmentaldashboard.org/edresources");
  expect(body).toContain("35 free lessons and units that use the dashboards in the classroom.");
  expect(body).not.toMatch(BANNED);
});

test("/research shows 10 featured papers and 8 citations, every one with a link", async ({ page }) => {
  const body = await text(page, "/research");
  await expect(page.getByRole("heading", { level: 1, name: "Research and publications" })).toBeVisible();
  await expect(page.locator("[data-paper]")).toHaveCount(10);
  await expect(page.locator("[data-citation]")).toHaveCount(8);
  for (const sel of ["[data-paper]", "[data-citation]"]) {
    const n = await page.locator(sel).count();
    for (let i = 0; i < n; i++) await expect(page.locator(sel).nth(i).locator("a")).toHaveCount(1);
  }
  await expect(page.locator("[data-paper]").first().getByRole("link")).toHaveAttribute("href", /^(https:\/\/|mailto:)/);
  expect(body).toContain("in press");
  expect(body).not.toMatch(BANNED);
});

test("/resources preserves the core resources and adds the original guide and press coverage", async ({ page }) => {
  const body = await text(page, "/resources");
  await expect(page.getByRole("heading", { level: 1, name: "Resources" })).toBeVisible();
  for (const [name, href] of [["View the deck", "/story"], ["Read the research", "/research"], ["Browse the lessons", "/toolkit"], ["Visit our dashboards", "/demos"]]) {
    await expect(page.getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", href);
  }
  await expect(page.getByRole("link", {name: /Read the guide/})).toHaveAttribute("href", "https://environmentaldashboard.org/bring-dashboard-to-your-community");
  await expect(page.getByRole("link", {name: /Explore coverage/})).toHaveAttribute("href", "https://environmentaldashboard.org/press-page");
  expect(body).not.toMatch(BANNED);
});

test("/work has five cases with live links, three org-only voices and no Toledo", async ({ page }) => {
  const body = await text(page, "/work");
  await expect(page.getByRole("heading", { level: 1, name: "Where it runs" })).toBeVisible();
  await expect(page.locator("[data-live-link]")).toHaveCount(5);
  await expect(page.locator("blockquote")).toHaveCount(3);
  await expect(page.getByText("Palmer Conservation Consulting")).toBeAttached();
  expect(body).not.toMatch(BANNED);
});
