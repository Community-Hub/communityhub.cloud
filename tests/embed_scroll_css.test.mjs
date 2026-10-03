import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/embed_scroll.css', 'utf8');

test('reserved embed scroll regions let the gesture chain out so the pager sees iframe drift', () => {
  const rule = css.match(/\.embed-scroll-region\[data-embed-scroll-reserved\]\s*\{([^}]*)\}/);
  assert.ok(rule, 'reserved region rule exists');
  assert.doesNotMatch(rule[1], /overscroll-behavior-y:\s*contain/);
  assert.match(rule[1], /overscroll-behavior-y:\s*auto/);
});
