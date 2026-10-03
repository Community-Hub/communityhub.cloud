import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { build } from 'vite';

let script;
before(async () => {
  const result = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: false, lib: { entry: 'src/scripts/pages_home9_fade.ts', formats: ['iife'], name: 'Carousel' } } });
  script = (Array.isArray(result) ? result[0] : result).output[0].code;
});

// A minimal DOM/time adapter runs the actual carousel controller. No timing
// policy is duplicated here; advancing time invokes its real scheduled callbacks.
function carousel({ reduced = false } = {}) {
  class Element {
    children = []; attrs = new Map(); events = new Map(); hidden = false;
    classList = { values: new Set(), add(...names) { names.forEach(n => this.values.add(n)); }, remove(...names) { names.forEach(n => this.values.delete(n)); }, toggle(name, on) { if (on) this.values.add(name); else this.values.delete(name); } };
    addEventListener(type, callback) { const list = this.events.get(type) || []; list.push(callback); this.events.set(type, list); }
    emit(type, event = {}) { for (const callback of this.events.get(type) || []) callback(event); }
    setAttribute(name, value) { this.attrs.set(name, value); }
    hasAttribute(name) { return this.attrs.has(name); }
    contains(element) { return element === this || this.children.some(child => child.contains(element)); }
    querySelector(selector) { return this.queries?.[selector] || null; }
    querySelectorAll(selector) { return this.lists?.[selector] || []; }
    closest() { return section; }
  }
  const animation = { animationName: 'pp-timer', currentTime: 0, playState: 'idle', pause() { this.playState = 'paused'; }, play() { this.playState = 'running'; } };
  const section = { getAnimations: () => [animation] };
  const box = new Element(), nav = new Element(), play = new Element(), previous = new Element(), next = new Element(), count = new Element();
  const slides = [new Element(), new Element(), new Element()];
  box.children = slides; box.nextElementSibling = nav;
  nav.children = [play, previous, next, count]; nav.setAttribute('data-pp-nav', '');
  nav.queries = { '[data-pp-play]': play, '[data-pp-prev]': previous, '[data-pp-next]': next, '[data-pp-count]': count };
  const document = new Element(); document.hidden = false; document.activeElement = null; document.lists = { '[data-pp-fade]': [box] };
  const media = new Element(); media.matches = reduced;
  let now = 0, id = 0, intersect;
  const jobs = new Map(), microtasks = [];
  const setTimeout = (callback, delay) => { const key = ++id; jobs.set(key, { at: now + delay, callback }); return key; };
  const clearTimeout = key => jobs.delete(key);
  class IntersectionObserver { constructor(callback) { intersect = callback; } observe() {} }
  runInNewContext(script, { document, HTMLElement: Element, matchMedia: () => media, performance: { now: () => now }, clearTimeout, queueMicrotask: f => microtasks.push(f), IntersectionObserver, window: { setTimeout, IntersectionObserver } });
  function advance(ms) {
    const end = now + ms;
    while (true) {
      const entry = [...jobs].sort((a, b) => a[1].at - b[1].at)[0];
      if (!entry || entry[1].at > end) break;
      now = entry[1].at; jobs.delete(entry[0]); entry[1].callback();
    }
    now = end;
  }
  function visible(on) { intersect([{ isIntersecting: on, intersectionRatio: on ? 1 : 0 }]); }
  function focus(on) { document.activeElement = on ? play : null; nav.emit(on ? 'focusin' : 'focusout'); while (microtasks.length) microtasks.shift()(); }
  const current = () => slides.findIndex(s => s.classList.values.has('is-on'));
  visible(true);
  return { box, nav, play, previous, next, document, media, advance, visible, focus, current, animation };
}

test('explicit pause keeps the picture and resumes the remaining story time', () => {
  const c = carousel(); c.advance(3000); c.play.emit('click'); c.advance(20000);
  assert.equal(c.current(), 0);
  c.play.emit('click'); c.advance(3999); assert.equal(c.current(), 0);
  c.advance(1); assert.equal(c.current(), 1);
});

test('hover and focus preserve elapsed time across overlapping pause gates', () => {
  const c = carousel(); c.advance(2000); c.box.emit('mouseenter'); c.focus(true); c.advance(9000);
  c.box.emit('mouseleave'); c.advance(1000); assert.equal(c.current(), 0);
  c.focus(false); c.advance(4999); assert.equal(c.current(), 0);
  c.advance(1); assert.equal(c.current(), 1);
});

test('offscreen and hidden-tab pauses preserve the remaining interval', () => {
  const c = carousel(); c.advance(2500); c.visible(false); c.advance(20000);
  c.visible(true); c.advance(500); c.document.hidden = true; c.document.emit('visibilitychange'); c.advance(10000);
  c.document.hidden = false; c.document.emit('visibilitychange'); c.advance(3999); assert.equal(c.current(), 0);
  c.advance(1); assert.equal(c.current(), 1);
});

test('manual next, previous and horizontal swipe reset the new picture interval', () => {
  const c = carousel(); c.advance(3000); c.next.emit('click'); assert.equal(c.current(), 1);
  c.advance(6999); assert.equal(c.current(), 1); c.advance(1); assert.equal(c.current(), 2);
  c.play.emit('click'); c.advance(1000); c.previous.emit('click'); assert.equal(c.current(), 1);
  c.play.emit('click'); c.advance(6999); assert.equal(c.current(), 1); c.advance(1); assert.equal(c.current(), 2);
  c.box.emit('touchstart', { touches: [{ clientX: 100, clientY: 100 }] });
  c.box.emit('touchend', { changedTouches: [{ clientX: 0, clientY: 100 }] });
  assert.equal(c.current(), 0); c.advance(6999); assert.equal(c.current(), 0); c.advance(1); assert.equal(c.current(), 1);
});

test('reduced motion starts paused and opting into play retains normal timing', () => {
  const c = carousel({ reduced: true }); c.advance(20000); assert.equal(c.current(), 0);
  c.play.emit('click'); c.advance(7000); assert.equal(c.current(), 1);
  c.advance(1000); c.media.matches = true; c.media.emit('change'); c.advance(10000); assert.equal(c.current(), 1);
});

test('visible progress freezes at elapsed time and resumes from the same point', () => {
  const c = carousel(); c.advance(2500); c.play.emit('click');
  assert.equal(c.animation.currentTime, 2500); assert.equal(c.animation.playState, 'paused');
  c.advance(10000); c.play.emit('click');
  assert.equal(c.animation.currentTime, 2500); assert.equal(c.animation.playState, 'running');
});
