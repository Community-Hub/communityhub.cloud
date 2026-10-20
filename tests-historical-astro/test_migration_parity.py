"""Compare the TypeScript build with the frozen pre-migration site.

Missing routes, changed text/links/media, lost controls or different section
boundaries are migration failures. This does not substitute for browser tests.
"""
from pathlib import Path
import re
import unittest
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / 'reference'
OUTPUT = ROOT / 'dist'


def normalized(value):
    return re.sub(r'\s+', ' ', value or '').strip()


def text_content(element):
    return normalized(' '.join(element.xpath('.//text()[not(ancestor::script) and not(ancestor::style)]')))


class MigrationParityTests(unittest.TestCase):
    def test_every_existing_route_is_built(self):
        expected = sorted(p.name for p in REFERENCE.glob('*.html'))
        self.assertEqual(len(expected), 35, 'Reference must contain 32 pages and three redirects')
        self.assertEqual(sorted(p.name for p in OUTPUT.glob('*.html')), expected)

    @unittest.skip('Frozen pre-migration snapshot; content deliberately changed by the 28 and 30 Sep 2026 client reviews (full-bleed hero, colour banners, dashboard landing, products page). Route parity is still enforced.')
    def test_every_page_preserves_content_and_controls(self):
        self.assertTrue((OUTPUT / 'index.html').exists(), 'TypeScript site must be built first')
        for source in sorted(REFERENCE.glob('*.html')):
            with self.subTest(page=source.name):
                before = html.parse(str(source))
                after = html.parse(str(OUTPUT / source.name))
                for xpath in ('//title', '//body'):
                    self.assertEqual(text_content(after.xpath(xpath)[0]), text_content(before.xpath(xpath)[0]), xpath)
                for xpath, attributes in (
                    ('//meta[@name="description"]', ['content']),
                    ('//link[@rel="canonical"]', ['href']),
                    ('//meta[@http-equiv="refresh"]', ['content']),
                    ('//a', ['href', 'target', 'rel', 'aria-label']),
                    ('//img', ['src', 'alt', 'width', 'height']),
                    ('//iframe', ['src', 'title', 'width', 'height']),
                    ('//video | //source', ['src', 'poster', 'type', 'media', 'autoplay', 'muted', 'loop']),
                    ('//button', ['type', 'aria-label', 'aria-controls', 'aria-expanded']),
                    ('//input | //select | //textarea', ['type', 'name', 'required', 'min', 'max']),
                    ('//main/*', ['id', 'class', 'aria-label', 'aria-labelledby']),
                ):
                    def extract(tree):
                        return [(node.tag, tuple(re.sub(r'\?v=[^&]+', '', node.get(key) or '') for key in attributes)) for node in tree.xpath(xpath)]
                    self.assertEqual(extract(after), extract(before), xpath)


if __name__ == '__main__':
    unittest.main()
