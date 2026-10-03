import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'vite';

let ui;
before(async () => {
  const result = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, minify: false, lib: { entry: 'src/lib/ui/index.ts', formats: ['es'] },
  } });
  ui = await import(`data:text/javascript;base64,${Buffer.from((Array.isArray(result) ? result[0] : result).output[0].code).toString('base64')}`);
});

test('all text and attribute boundaries escape hostile input', () => {
  const hostile = `\"><img src=x onerror=alert(1)>&'`;
  const html = [ui.renderButton({ label: hostile, id: hostile }), ui.renderField({ id: 'field', name: hostile, label: hostile, value: hostile }), ui.renderField({ id: 'area', name: 'area', label: 'Message', kind: 'textarea', value: '</textarea><script>alert(1)</script>' }), ui.renderStatus({ id: 'status', message: hostile })].join('');
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<script'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(html.includes('&lt;/textarea&gt;'));
});
test('links reject executable, protocol-relative and obfuscated destinations', () => {
  for (const href of ['javascript:alert(1)', 'data:text/html,hello', 'java\nscript:alert(1)', '//evil.example', '\\evil.example', 'vbscript:x']) {
    assert.throws(() => ui.renderActionLink({ label: 'Open', href }));
  }
  for (const href of ['/contact.html', '#form', 'products.html', 'https://example.com/?a=1&b=2', 'mailto:connect@communityhub.cloud']) {
    assert.match(ui.renderActionLink({ label: 'Open', href }), /<a /);
  }
  assert.match(ui.renderActionLink({ label: 'Open', href: 'https://example.com', newTab: true }), /noopener noreferrer/);
});
test('buttons cannot accidentally submit forms; loading prevents activation', () => {
  assert.match(ui.renderButton({ label: 'Preview' }), /type="button"/);
  const loading = ui.renderButton({ label: 'Save', loading: true, loadingLabel: 'Saving…' });
  assert.match(loading, / disabled/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /Saving…/);
});
test('fields associate labels, hints, external descriptions and errors', () => {
  const html = ui.renderField({ id: 'name', name: 'name', label: 'Name', required: true, hint: 'Your name', error: 'Required', describedBy: 'form-help' });
  assert.match(html, /for="name"/);
  assert.match(html, /aria-describedby="form-help name-hint name-error"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /id="name-error"/);
  assert.match(ui.renderField({ id: 'clear', name: 'clear', label: 'Clear' }), /id="clear-error" hidden/);
});
test('misconfigured controls fail at build time', () => {
  assert.throws(() => ui.renderButton({ label: ' ' }));
  assert.throws(() => ui.renderField({ id: 'bad id', name: 'n', label: 'Name' }));
  assert.throws(() => ui.renderField({ id: 'n', name: 'n', label: 'Name', maxLength: -2 }));
  assert.throws(() => ui.renderField({ id: 'n', name: 'n', label: 'Name', kind: 'textarea', rows: 0 }));
});
