import test from "node:test";
import assert from "node:assert/strict";
import { hitTest } from "../hit.js";

function el(spec) {
  return {
    getBoundingClientRect: () => spec.rect,
    offsetLeft: spec.offsetLeft || 0,
    offsetTop: spec.offsetTop || 0,
    offsetWidth: spec.offsetWidth || 0,
    offsetHeight: spec.offsetHeight || 0,
    scrollLeft: spec.scrollLeft || 0,
    scrollTop: spec.scrollTop || 0,
    querySelectorAll: () => spec.blocks || [],
    id: spec.id,
  };
}

test("after scroll hit still on block", () => {
  const block = el({ id: "target", offsetLeft: 80, offsetTop: 100, offsetWidth: 60, offsetHeight: 40,
    rect: { left: 20, top: 10, width: 60, height: 40 } });
  const inner = el({ rect: { left: 0, top: 0, width: 400, height: 300 }, blocks: [block] });
  const outer = el({ rect: { left: 0, top: 0, width: 200, height: 120 }, scrollLeft: 40, scrollTop: 30 });
  // click where block visually is after scroll
  const got = hitTest(outer, inner, 20 + 10, 10 + 10);
  assert.equal(got, "target");
});

test("no scroll no scale still hits (regression)", () => {
  const block = el({ id: "target", offsetLeft: 80, offsetTop: 100, offsetWidth: 60, offsetHeight: 40,
    rect: { left: 80, top: 100, width: 60, height: 40 } });
  const inner = el({ rect: { left: 0, top: 0, width: 400, height: 300 }, blocks: [block] });
  const outer = el({ rect: { left: 0, top: 0, width: 200, height: 120 } });
  assert.equal(hitTest(outer, inner, 100, 120), "target");
  assert.equal(hitTest(outer, inner, 80, 100), "target");
});

test("scaled inner: hit uses visual (scaled) rect", () => {
  // layout 80,100,60x40 scaled 1.25 from origin -> visual 100,125,75x50
  const block = el({ id: "target", offsetLeft: 80, offsetTop: 100, offsetWidth: 60, offsetHeight: 40,
    rect: { left: 100, top: 125, width: 75, height: 50 } });
  const inner = el({ rect: { left: 0, top: 0, width: 500, height: 375 }, blocks: [block] });
  const outer = el({ rect: { left: 0, top: 0, width: 200, height: 120 } });
  assert.equal(hitTest(outer, inner, 120, 140), "target");
  // layout coords without scale correction would wrongly hit here
  assert.equal(hitTest(outer, inner, 85, 105), null);
});

test("scrolled and scaled: hit follows visual position", () => {
  // outer scrolled 40,30; inner scaled 1.25 -> block visual rect below
  const block = el({ id: "target", offsetLeft: 80, offsetTop: 100, offsetWidth: 60, offsetHeight: 40,
    rect: { left: 60, top: 95, width: 75, height: 50 } });
  const inner = el({ rect: { left: -40, top: -30, width: 500, height: 375 }, blocks: [block] });
  const outer = el({ rect: { left: 0, top: 0, width: 200, height: 120 }, scrollLeft: 40, scrollTop: 30 });
  assert.equal(hitTest(outer, inner, 70, 110), "target");
  assert.equal(hitTest(outer, inner, 10, 10), null);
});

test("click outside every block returns null", () => {
  const block = el({ id: "target", offsetLeft: 80, offsetTop: 100, offsetWidth: 60, offsetHeight: 40,
    rect: { left: 80, top: 100, width: 60, height: 40 } });
  const inner = el({ rect: { left: 0, top: 0, width: 400, height: 300 }, blocks: [block] });
  const outer = el({ rect: { left: 0, top: 0, width: 200, height: 120 } });
  assert.equal(hitTest(outer, inner, 10, 10), null);
  assert.equal(hitTest(outer, inner, 141, 120), null);
});
