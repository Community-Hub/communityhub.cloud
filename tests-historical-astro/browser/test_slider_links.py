"""Task 11 (28 Sep review): the homepage slider links out across the site, client dashboards sit under
one "Dashboard demos" heading, and every embedded client dashboard links to its owner's own site."""
import re
import unittest
from pathlib import Path
from html.parser import HTMLParser
from lxml import html

SITE = Path(__file__).resolve().parents[2] / "dist"


def read(name):
    return (SITE / name).read_text(encoding="utf-8")


class SliderLinksTest(unittest.TestCase):
    def test_every_story_card_has_original_primary_and_supported_secondary_links(self):
        home = read("index.html")
        rail = re.search(r'<div class="pp-fade"(.*?)</section>', home, re.S).group(1)
        cards = re.findall(r'<figure class="pp">(.*?)</figure>', rail, re.S)
        self.assertGreaterEqual(len(cards), 6)
        for card in cards:
            links = re.findall(r'<a class="pp-btn[^"]*" href="([^"]+)"', card)
            self.assertEqual(len(links), 1, card[:120])
            for href in links:
                page, _, anchor = href.partition("#")
                self.assertTrue((SITE / page).exists(), href)
                if anchor:
                    self.assertIn(f'id="{anchor}"', read(page), href)

    def test_slider_keeps_original_primary_product_destinations(self):
        home = read("index.html")
        for href in ("digital-signage.html", "phone-app.html", "web-embeddables.html",
                     "building-dashboard.html", "citywide-dashboard.html", "the-hub.html",
                     "community-calendar.html", "community-voices.html"):
            self.assertIn(f'class="pp-btn', home)
            self.assertIn(f'href="{href}"', home, href)

    def test_dashboard_demos_heading_groups_client_dashboards(self):
        home = read("index.html")
        panel = re.search(r'id="dd-live">(.*?)</li>', home, re.S).group(1)
        demos = panel.split("Working now")[0]
        self.assertIn("Dashboard demos", demos)
        for key, name in (
            ("city-of-oberlin", "City of Oberlin"),
            ("oberlin-city-schools", "Oberlin City Schools"),
            ("oberlin-college", "Oberlin College"),
            ("great-lakes-science-center", "Great Lakes Science Center"),
        ):
            href = "dashboards.html#" + key
            self.assertIn(href, demos)
            gallery = read("dashboards.html")
            self.assertIn(f'id="{key}" role="tabpanel"', gallery)
            self.assertIn(f'aria-controls="{key}"', gallery)
            self.assertRegex(gallery, rf'data-dashboard-key="{key}"[^>]*>{re.escape(name)}</button>')

    def test_every_embedded_client_dashboard_has_its_matching_destination(self):
        # John (30 Sep) named the City's Sustainability page. The school's own homepage
        # has a verified anchored image link to the same OPS dashboard.
        destinations = {
            'oc-embed': 'https://www.oberlin.edu/arts-and-sciences/departments/environmental-studies/dashboard',
            'glsc-embed': 'https://greatscience.com/explore/exhibits/environmental-dashboard',
            'ops-embed': 'https://www.oberlinschools.net/#h.78ca501b910ca40b_115',
            'city-of-oberlin': 'https://cityofoberlin.com/city-government/departments/sustainability/',
        }
        class Frames(HTMLParser):
            def __init__(self):
                super().__init__(); self.frames = []; self.current = None
            def handle_starttag(self, tag, attrs):
                a = dict(attrs)
                if tag == 'figure' and 'live-frame' in a.get('class', '').split():
                    self.current = {'src': a.get('data-src', ''), 'links': []}
                    self.frames.append(self.current)
                if tag == 'a' and self.current is not None and 'lf-org' in a.get('class', '').split():
                    self.current['links'].append(a.get('href'))
            def handle_endtag(self, tag):
                if tag == 'figure': self.current = None
        seen = set()
        for path in SITE.glob('*.html'):
            parser = Frames(); parser.feed(path.read_text())
            for frame in parser.frames:
                for slug, destination in destinations.items():
                    if '/dh-public/' + slug in frame['src']:
                        seen.add(slug)
                        self.assertIn(destination, frame['links'], (path.name, frame))
        self.assertEqual(seen, set(destinations))

    def test_current_live_scenes_expose_matching_partner_links_above_embeds(self):
        for route, section, destination in (
            ('data-dashboard.html','building','https://www.oberlin.edu/arts-and-sciences/departments/environmental-studies/dashboard'),
            ('the-hub.html','live','https://cityofoberlin.com/city-government/departments/sustainability/'),
        ):
            with self.subTest(route=route,section=section):
                scene=html.fromstring(read(route)).get_element_by_id(section)
                frames=scene.xpath('.//figure[contains(concat(" ",@class," ")," live-frame ")]')
                self.assertEqual(len(frames),1)
                links=frames[0].xpath('./div[contains(concat(" ",@class," ")," bar ")]/a[contains(concat(" ",@class," ")," lf-org ")]')
                self.assertEqual(len(links),1)
                link=links[0]
                self.assertEqual(link.get('href'),destination)
                self.assertIn('Visit partner page',link.text_content())
                self.assertTrue(link.get('aria-label').startswith('Visit '))
                self.assertEqual(link.get('target'),'_blank')
                self.assertEqual(set(link.get('rel').split()),{'noopener','noreferrer'})


if __name__ == "__main__":
    unittest.main()
