"""Task 14 (28 Sep review): John's dashboard papers each get a simple graphical abstract, the main finding,
and a link to the paper, in groups small enough to fit one screen."""
import re
import unittest
from pathlib import Path

SITE = Path(__file__).resolve().parents[2] / "dist"


class ResearchAbstractsTest(unittest.TestCase):
    def setUp(self):
        self.html = (SITE / "research.html").read_text(encoding="utf-8")

    def cards(self, sid):
        sec = re.search(rf'<section[^>]*id="{sid}"(.*?)</section>', self.html, re.S).group(1)
        return re.findall(r'<article class="va-card"(.*?)</article>', sec, re.S)

    def test_two_groups_of_five(self):
        for sid in ("papers-feedback", "papers-voices"):
            self.assertEqual(len(self.cards(sid)), 5, sid)

    def test_every_card_has_finding_and_honest_access_path(self):
        paper_links, requests = [], []
        for sid in ("papers-feedback", "papers-voices"):
            for c in self.cards(sid):
                # Only measured charts keep a drawing; the rest are plain text articles.
                if 'data-paper-format="chart"' in c:
                    self.assertIn('<svg class="va"', c)
                elif 'data-paper-format="figure"' in c:
                    # The character gauges paper shows Flash and Wally at each level instead of a chart.
                    self.assertIn('class="gauge-faces"', c)
                    self.assertNotIn('<svg class="va"', c)
                else:
                    self.assertIn('data-paper-format="text"', c)
                    self.assertNotIn('<svg class="va"', c)
                self.assertRegex(c, r"<p>[^<]{40,}</p>")
                if "Read the paper" in c:
                    paper_links.append(c)
                else:
                    self.assertIn("Sustainability (accepted)", c)
                    self.assertIn('href="mailto:connect@communityhub.cloud?subject=Paper%20request', c)
                    self.assertIn("Request the paper", c)
                    requests.append(re.search(r"<h3>(.*?)</h3>", c).group(1))
        # This request path is explicit; task 14 still needs the actual paper URL and CV.
        self.assertEqual(len(paper_links), 9)
        self.assertEqual(requests, ["Translating data into feelings"])

    def test_gauges_abstract_follows_johns_example(self):
        first = self.cards("papers-feedback")[0]
        for word in ("261 people", "three studies", "character gauges"):
            self.assertIn(word, first)

    def test_links_are_dois_or_known_pdf(self):
        for href in re.findall(r'<a class="pc-a" href="([^"]+)"[^>]*>Read the paper', self.html):
            self.assertRegex(href, r"^https://(doi\.org/10\.|environmentaldashboard\.org/)")


if __name__ == "__main__":
    unittest.main()
