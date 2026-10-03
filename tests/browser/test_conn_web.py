"""Latest Who We Are contract: one centered original identity, no right diagram."""
import unittest
from pathlib import Path
from lxml import html

SITE = Path(__file__).resolve().parents[2] / 'dist'
MISSION = ('Community Hub is a community-centered communication platform, with tools to gather data and put it on display. '
           'With them, organizations, neighborhoods and cities engage, educate, motivate and empower their communities, '
           'building connection and resilience in a rapidly changing environment.')


class IdentitySourceTest(unittest.TestCase):
    def setUp(self):
        self.page = html.fromstring((SITE / 'index.html').read_text(encoding='utf-8'))
        self.section = self.page.get_element_by_id('problem')

    def test_one_source_identity_retains_exact_mission_and_about_link(self):
        self.assertIsNotNone(self.section.get('data-identity-explanation'))
        self.assertIsNotNone(self.section.get('data-stable-start'))
        self.assertEqual(self.section.get('data-sequence-phase'), 'complete')
        self.assertEqual(len(self.section.xpath('.//*[@data-identity-content]')), 1)
        self.assertEqual(len(self.section.xpath('.//*[@data-roll]')), 1)
        self.assertEqual(self.section.xpath('.//h2')[0].text_content(), 'Who we are')
        self.assertEqual(self.section.xpath('.//p')[0].text_content(), MISSION)
        self.assertEqual(self.section.xpath('.//a/@href'), ['about.html'])
        self.assertEqual(self.section.xpath('.//*[@data-roll]/img/@src'), [
            'assets/ro-cv.png', 'assets/ro-cwd.png', 'assets/ro-ch.png',
            'assets/ro-bd.png', 'assets/ro-cal.png'])

    def test_separate_right_explanation_and_controls_are_removed(self):
        self.assertFalse(self.section.xpath('.//*[@data-platform-explanation or @data-platform-panel or @data-platform-replay or @data-conn]'))
        self.assertFalse(self.section.xpath('.//figure|.//figcaption|.//button'))
        self.assertNotIn('Data sources', self.section.text_content())
        self.assertNotIn('Replay', self.section.text_content())


if __name__ == '__main__':
    unittest.main()
