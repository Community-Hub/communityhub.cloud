"""Task 13 (28 Sep review): Story of Dashboard is its own storyboard page under Resources, not on the
homepage. Each slide has a short note, and the original presentation is embedded as is."""
import json
import re
import unittest
from pathlib import Path

SITE = Path(__file__).resolve().parents[2] / "dist"


class StoryOfDashboardTest(unittest.TestCase):
    def setUp(self):
        self.html = (SITE / "story-of-dashboard.html").read_text(encoding="utf-8")

    def test_every_slide_has_an_image_and_a_short_note(self):
        data = json.loads(re.search(r'<script type="application/json" data-sb-data>(.*?)</script>', self.html, re.S).group(1))
        self.assertEqual(len(data), 31)
        for k, s in enumerate(data, 1):
            self.assertTrue((SITE / "assets" / "sod" / f"{k:02d}.jpg").exists(), k)
            self.assertTrue((SITE / "assets" / "sod" / f"t{k:02d}.jpg").exists(), k)
            self.assertTrue(s["t"] and s["d"], k)
            self.assertLessEqual(len(s["d"].split()), 20, s["d"])
        self.assertEqual(len(re.findall(r'data-sb-go="', self.html)), 31)

    def test_original_presentation_is_embedded(self):
        self.assertRegex(self.html, r'<iframe (?:data-defer-)?src="https://docs\.google\.com/presentation/d/e/[^"]+/embed')

    def test_in_the_resources_menu_and_off_the_homepage(self):
        home = (SITE / "index.html").read_text(encoding="utf-8")
        menu = re.search(r'id="dd-res">(.*?)</div>', home, re.S).group(1)
        self.assertIn('href="story-of-dashboard.html"', menu)
        main = home.split('id="main"', 1)[1]
        self.assertNotIn("data-sb", main)
        self.assertNotIn("docs.google.com/presentation", main)


if __name__ == "__main__":
    unittest.main()
