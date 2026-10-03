"""Current delivery contracts: routes, usable local links, and preserved sources.

The exact migration comparison remains available separately. These checks permit
the September 30 requested design changes without losing existing destinations
or silently rewriting testimonial evidence.
"""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib
import json
import unittest
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'dist'
ROUTES = '''404 about bring-a-dashboard building-dashboard campuses cities
city-of-oberlin citywide-dashboard community-calendar community-voices contact
dashboards data-dashboard data-hub digital-signage education environmental-dashboard
examples great-lakes-science-center hamilton-college index media midtown-cleveland
museums neighborhoods oberlin-college phone-app pricing products research resources schools
see-it-live stories story-of-dashboard the-hub web-embeddables who-its-for'''.split()


class SiteContractsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pages = {p.name: html.parse(str(p)) for p in SITE.glob('*.html')}
        cls.uploaded_images = {i['path']: i for i in json.loads((ROOT / 'tests/fixtures/uploaded-optimized-media.json').read_text())['images']}
        cls.approved = json.loads((ROOT / 'tests/fixtures/approved-refinements.json').read_text())

    def assert_source_media(self, path, historical_sha):
        # Historical source hashes remain immutable. The user-supplied archive
        # contains optimized derivatives; assert their separately recorded bytes.
        current = hashlib.sha256((SITE / path).read_bytes()).hexdigest()
        uploaded = self.uploaded_images.get(path)
        self.assertEqual(current, uploaded['sha256'] if uploaded else historical_sha, path)

    def test_all_existing_routes_remain_available(self):
        self.assertEqual(sorted(self.pages), sorted(s + '.html' for s in ROUTES))

    def test_every_local_link_asset_and_fragment_resolves(self):
        missing = set()
        for name, tree in self.pages.items():
            for node in tree.xpath('//*[@href or @src or @data-src]'):
                for attr in ('href', 'src', 'data-src'):
                    raw = node.get(attr)
                    if not raw:
                        continue
                    url = urlsplit(raw)
                    if url.scheme or url.netloc:
                        continue
                    path = SITE / unquote(url.path).lstrip('/') if url.path else SITE / name
                    if path.is_dir():
                        path /= 'index.html'
                    if not path.is_file():
                        missing.add((name, raw, 'file'))
                    elif attr == 'href' and url.fragment and path.suffix == '.html':
                        dest = self.pages.get(path.name)
                        if dest is not None and not dest.xpath('//*[@id=$id or @name=$id]', id=unquote(url.fragment)):
                            missing.add((name, raw, 'fragment'))
        self.assertEqual(sorted(missing), [])

    def test_live_testimonial_quotes_attributions_photos_and_primary_links_are_preserved(self):
        source = json.loads((ROOT / 'tests/fixtures/live-home-source.json').read_text())
        expected = source['testimonials']
        normalize = lambda node: ' '.join(node.text_content().split())
        stories = self.pages['index.html'].xpath('//*[@id="people"]//figure[contains(concat(" ",normalize-space(@class)," ")," pp ")]')
        destinations = ['digital-signage.html', 'phone-app.html', 'web-embeddables.html',
                        'building-dashboard.html', 'citywide-dashboard.html', 'the-hub.html',
                        'community-calendar.html', 'community-voices.html']
        self.assertEqual(len(stories), 8)
        for story, original, destination in zip(stories, expected, destinations):
            image = story.xpath('.//img')[0]
            self.assertEqual(normalize(story.xpath('.//blockquote')[0]), original['quote'])
            attribution = self.approved['testimonials'].get(original['name'] if 'name' in original else original.get('who', ''), {}).get('attribution', original['attribution'])
            if original['attribution'].startswith('Scott Volmer '): attribution = self.approved['testimonials']['Scott Volmer']['attribution']
            self.assertEqual(normalize(story.xpath('.//figcaption')[0]), attribution)
            self.assertEqual(image.get('src'), original['image']['local_path'])
            self.assert_source_media(original['image']['local_path'], original['image']['sha256'])
            links = story.xpath('.//a[@href]')
            self.assertTrue(links)
            label = ' '.join(''.join(links[0].xpath('.//text()[not(ancestor::*[@aria-hidden="true"])]')).split())
            # House rule: no "Learn more" lead-in on links.
            self.assertEqual(label, original['primary_cta']['label'].replace('Learn more: ', ''))
            self.assertEqual(links[0].get('href'), destination)

    def test_live_homepage_mission_headline_and_eight_descriptions_are_preserved(self):
        source = json.loads((ROOT / 'tests/fixtures/live-home-source.json').read_text())
        home = self.pages['index.html']
        normalize = lambda node: ' '.join(node.text_content().split())
        text = normalize(home.xpath('//main')[0])
        self.assertIn(source['headline'], text)
        self.assertIn(self.approved['homepage_mission'], normalize(home.xpath('//*[@id="problem"]')[0]))
        paragraphs = [normalize(p) for p in home.xpath('//main//p')]
        for product in source['products']:
            # Preserve original author punctuation exactly.
            wanted = product['description']
            # The live sentence may be finished (the phone app adds "by scanning a QR code"), never trimmed.
            self.assertTrue(any(p.startswith(wanted) for p in paragraphs), product['name'])

    def test_original_product_descriptions_remain_on_the_corresponding_pages(self):
        products = json.loads((ROOT / 'src/content/live-products.json').read_text())['products']
        for slug, original in products.items():
            route = 'data-dashboard' if slug in ('building-dashboard', 'citywide-dashboard') else slug
            tree = self.pages[route + '.html']
            paragraphs = [' '.join(p.text_content().split()) for p in tree.xpath('//main//p')]
            self.assertIn(original['description'], paragraphs, original['name'])

    def test_live_organization_mission_team_and_contact_are_preserved(self):
        source = json.loads((ROOT / 'tests/fixtures/live-organization-source.json').read_text())
        normalize = lambda node: ' '.join(node.text_content().split())
        about = self.pages['about.html']
        paragraphs = [normalize(p) for p in about.xpath('//main//p')]
        for paragraph in source['team_page']['mission_paragraphs']:
            self.assertIn(paragraph, paragraphs)
        people = about.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," rs-person ")]')
        self.assertEqual(len(people), 6)
        for person, original in zip(people, source['team_page']['team']):
            self.assertEqual(normalize(person.xpath('.//figcaption')[0]), f"{original['name']}, {original['role']}")
            self.assertEqual(person.xpath('.//img')[0].get('src'), original['image']['local_path'])
            self.assert_source_media(original['image']['local_path'], original['image']['sha256'])
        listing = about.xpath('//a[@href="https://www.communityhub.cloud/team/"]')
        self.assertTrue(any('December 2021' in normalize(a) for a in listing))
        contact = self.pages['contact.html']
        original = source['contact_page']
        self.assertIn(original['introduction'], [normalize(p) for p in contact.xpath('//main//p')])
        self.assertTrue(contact.xpath('//img[@src=$src]', src=original['image']['local_path']))
        self.assert_source_media(original['image']['local_path'], original['image']['sha256'])

    def test_hamilton_has_no_public_dashboard_endpoint(self):
        for name, tree in self.pages.items():
            for node in tree.xpath('//*[@href or @src or @data-src or @data-live]'):
                for attr in ('href', 'src', 'data-src', 'data-live'):
                    url = urlsplit(node.get(attr) or '')
                    if url.netloc:
                        self.assertFalse('hamilton' in url.netloc.lower() and
                                         ('communityhub' in url.netloc or 'dashboard' in url.netloc),
                                         (name, node.get(attr)))
        page = self.pages['hamilton-college.html']
        self.assertFalse(page.xpath('//iframe'), 'Hamilton must have no live iframe')

    def test_lesson_titles_open_verified_official_pdfs(self):
        normalize = lambda node: ' '.join(node.text_content().split())
        tree = self.pages['education.html']
        links = tree.xpath('//*[@id="lessons"]/li//a')
        self.assertEqual(len(links), 35)
        verified = json.loads((ROOT / 'docs/refinement-20261002/verified-lesson-links.json').read_text())
        self.assertEqual(verified['verifiedWorking'], 35)
        for link in links:
            self.assertEqual(link.get('href'), verified['links'][normalize(link)])
            self.assertEqual(link.get('target'), '_blank')

    def test_chart_explanations_are_adjacent_and_closed_initially(self):
        for name, tree in self.pages.items():
            self.assertFalse(tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," dv-frame ")]//*[contains(concat(" ",normalize-space(@class)," ")," dv-note ")]'), name)
            for note in tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," dv-note ")]'):
                self.assertIn('hidden', note.attrib, name)

    def test_home_arrival_is_one_combined_semantic_section(self):
        home = self.pages['index.html']
        hero = home.xpath('//main/section[contains(concat(" ",normalize-space(@class)," ")," hv ")]')
        self.assertEqual(len(hero), 1)
        self.assertIn("full", hero[0].get("class", "").split())
        self.assertIn("hidden", hero[0].xpath('.//*[@id="people"]')[0].attrib)
        self.assertEqual(len(hero[0].xpath('.//*[@id="people"]')), 1)
        self.assertFalse(home.xpath('//main/section[@id="people"]'))
        self.assertEqual(len(home.xpath('//*[@id="people"]')), 1)

    def test_home_hero_retains_skip_and_forward_only_video(self):
        home = self.pages['index.html']
        self.assertEqual(len(home.xpath('//a[@data-hv-next]')), 1)
        videos = home.xpath('//video[@data-hv-vid]')
        self.assertEqual(len(videos), 1)
        self.assertNotIn('loop', videos[0].attrib)
        self.assertEqual(videos[0].get("poster"), "assets/hero-first-frame.jpg")
        self.assertEqual(len(home.xpath('//*[@data-hv-stills]/i')), 1)
        self.assertTrue(all('hero-ch-fwd' in x.get('src', '') for x in videos[0].xpath('.//source')))


if __name__ == '__main__':
    unittest.main()
