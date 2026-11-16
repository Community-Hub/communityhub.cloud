import { test, expect } from "@playwright/test";

test.describe("/story", () => {
  test("shows the original editable presentation with playback control", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/story");
    await expect(page.getByRole("heading", {level: 1, name: "Story of the Dashboard"})).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(1);
    await expect(page.locator("iframe")).toHaveAttribute("src", /docs.google.com\/presentation\/.*start=false/);
    await expect(page.getByRole("button", {name: "Start story preview"})).toBeVisible();
    await expect(page.getByRole("link", {name: "Original presentation on Environmental Dashboard"}).first()).toHaveAttribute("href", "https://environmentaldashboard.org/story-of-dashboard");
  });

  test("keeps Hamilton, AASHE and quote names out", async ({ page }) => {
    await page.goto("/story", { waitUntil: "load" });
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/AASHE|Hamilton/);
  });
});

test.describe("/about", () => {
  test("shows John's Systems thinkers slide as the diagram", async ({ page }) => {
    await page.goto("/about", { waitUntil: "load" });
    await expect(page.locator("img[src='/assets/sod/11.jpg.webp']")).toBeAttached();
    await expect(page.getByText("part of larger wholes")).toBeAttached();
  });

  test("has Where it began and Supporters, with the sourced text", async ({ page }) => {
    await page.goto("/about", { waitUntil: "load" });
    // Unsourced company-history copy (COPY-AUDIT About #5) stays off until John signs it.
    await expect(page.getByText("which began in 2008")).toHaveCount(0);
    await expect(page.getByText("Environmental Dashboard work has been funded by the U.S. EPA, the Great Lakes Protection Fund, the Cleveland Foundation and, through the Great Lakes Colleges Association, the Andrew W. Mellon Foundation")).toBeAttached();
    await expect(page.locator("img[alt^='Aerial view of downtown Oberlin']")).toBeAttached();
    for (const [name, href] of [["Read the research", "/research"], ["See where it runs", "/work"], ["Story of the Dashboard", "/story"]]) {
      await expect(page.getByRole("link", { name }).first()).toHaveAttribute("href", href);
    }
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/AASHE|Hamilton/);
  });
});
