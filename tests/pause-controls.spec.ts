import { expect, test } from "@playwright/test";

// Voices, Community Voices and the Story slideshow have a Pause / Play control (keyboard operable, label switches, paused under reduced motion). The hero film has none.

test("the stories rotation starts paused under reduced motion and Play starts it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const play = page.getByRole("button", { name: "Play stories" });
  await expect(play).toBeVisible();
  await play.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Pause stories" })).toBeVisible();
});

test("Community Voices rotation has Pause / Play, paused under reduced motion", async ({ page }) => {
  await page.goto("/community-voices", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[inert]").first()).toBeAttached();
  const pause = page.getByRole("button", { name: "Pause Community Voices" });
  await expect(pause).toBeVisible();
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Play Community Voices" })).toBeVisible();
  const reduced = await page.context().newPage();
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto("/community-voices", { waitUntil: "domcontentloaded" });
  await expect(reduced.getByRole("button", { name: "Play Community Voices" })).toBeVisible();
});

test("the Story of Dashboard slideshow has playback controls and loads paused under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/story", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Start story preview" })).toBeAttached();
  await expect(page.locator('iframe[src*="start=false"]')).toBeAttached();
});

test("no portrait of a person on /digital-signage", async ({ page }) => {
  await page.goto("/digital-signage", { waitUntil: "domcontentloaded" });
  await expect(page.locator("img[alt*='Petersen'], img[src*='live-team']")).toHaveCount(0);
});
