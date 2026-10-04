"""Homepage story contracts: place and people share an opening section, followed
by Who We Are, Engage, Educate and Motivate with their original source links."""
import json
import re
import unittest
from pathlib import Path

from lxml import html

SITE = Path(__file__).resolve().parents[2] / "dist"


class HomeNarrativeTest(unittest.TestCase):
    def setUp(self):
        self.html = (SITE / "index.html").read_text(encoding="utf-8")

    def test_story_order(self):
        order = ['class="hv', 'id="people"', 'id="problem"', 'id="engage"', 'id="products"', 'id="motivate"']
        pos = [self.html.find(k) for k in order]
        self.assertNotIn(-1, pos, dict(zip(order, pos)))
        self.assertEqual(pos, sorted(pos))
        self.assertNotIn('id="how"', self.html)
        self.assertNotIn('id="hub"', self.html)
        page = html.fromstring(self.html)
        hero = page.xpath('//main/section[contains(concat(" ",normalize-space(@class)," ")," hv ")]')
        self.assertEqual(len(hero), 1)
        self.assertIn('full', hero[0].get('class').split())
        self.assertEqual(len(hero[0].xpath('./div[contains(concat(" ",normalize-space(@class)," ")," hv-film ")]')), 1)
        people = page.get_element_by_id('people')
        self.assertEqual(people.tag, 'div')
        self.assertIs(people.getparent(), hero[0])
        self.assertIn('hidden', people.attrib)
        self.assertEqual(page.xpath('//main/section/@id')[:4], ['problem', 'engage', 'products', 'motivate'])

    def test_headings(self):
        page = html.fromstring(self.html)
        source = json.loads((SITE.parent / "tests/fixtures/live-home-source.json").read_text())
        def heading_text(section):
            element = page.xpath(f'//section[@id="{section}"]//h2')[0]
            return " ".join(" ".join(element.itertext()).split())
        self.assertEqual(' '.join(page.xpath('//h1')[0].text_content().split()), source['headline'])
        self.assertEqual(' '.join(page.get_element_by_id('people').xpath('.//h2')[0].text_content().split()), 'How we solve it')
        self.assertEqual(heading_text("problem"), "Who we are")
        for section, heading in (("engage", "Engage"), ("products", "Educate"), ("motivate", "Motivate and empower")):
            self.assertEqual(heading_text(section), heading)
        problem = html.tostring(page.get_element_by_id('problem'), encoding='unicode')
        self.assertIn("data-communication-sequence", self.html)
        self.assertIn('data-identity-explanation', problem)
        self.assertIn('data-identity-content', problem)
        self.assertEqual(len(page.get_element_by_id('problem').xpath('.//*[@data-roll]/img')),5)
        self.assertNotIn('data-conn', problem)
        self.assertNotIn('data-platform-panel', problem)

    def test_each_product_has_one_learn_more_link(self):
        # The September 30 source moved product cards into named Engage/Educate/
        # Motivate panels. Keep the same link-count invariant on that structure.
        cards = re.findall(r'<article\b[^>]*\bdata-eng-panel[^>]*>(.*?)</article>', self.html, re.S)
        self.assertGreaterEqual(len(cards), 5)
        for c in cards:
            self.assertEqual(len(re.findall(r'class="pc-a', c)), 1, c[:120])
            self.assertRegex(c, r'>Learn more ' )

    def test_leads_to_products_without_new_generic_sales_copy(self):
        self.assertIn('href="products.html"', self.html)
        # Kwaku explicitly retained the live site's writing, including Learn More.
        self.assertNotRegex(self.html.lower(), r"get started|unlock the power")


if __name__ == "__main__":
    unittest.main()
