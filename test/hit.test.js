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

// Geometry used below (matches index.html):
// outer border-box left/top = 1/1; inner border-box left/top = 2/2;
// block layout (80,100,60,40); inner scaled 1.25 from origin 0 0.
// block client rect = inner origin (2,2) + layout*1.25 - scroll.
// no scroll: rect (102,127,75,50); scroll 40,30: rect (62,97,75,50).

test("after scroll hit still on block", () => {
  const block = el({ id: "target", offsetLeft: 80, offsetTop: 100, offsetWidth: 60, offsetHeight: 40,
    rect: { left: 62, top: 97, width: 75, height: 50 } });
  const inner = el({ rect: { left: 2, top: 2, width: 500, height: 375 }, blocks: [block] });
  const outer = el({ rect: { left: 1, top: 1, width: 200, height: 120 }, scrollLeft: 40, scrollTop: 30 });
  // fixed point where the block visually is after scroll
  assert.equal(hitTest(outer, inner, 82, 117), "target");
});

test("no scroll: clicks that already worked keep working", () => {
  const block = el({ id: "target", offsetLeft: 80, offsetTop: 100, offsetWidth: 60, offsetHeight: 40,
    rect: { left: 102, top: 127, width: 75, height: 50 } });
  const inner = el({ rect: { left: 2, top: 2, width: 500, height: 375 }, blocks: [block] });
  const outer = el({ rect: { left: 1, top: 1, width: 200, height: 120 } });
  assert.equal(hitTest(outer, inner, 103, 128), "target");   // near top-left
  assert.equal(hitTest(outer, inner, 176, 176), "target");   // near bottom-right
  assert.equal(hitTest(outer, inner, 140, 150), "target");   // middle
});

test("scale: hit uses scaled 75x50 rect, not layout 60x40", () => {
  // (165,162) is inside scaled rect (102..177 x 127..177)
  // but outside a naive unscaled box measured from the outer origin.
  const block = el({ id: "target", offsetLeft: 80, offsetTop: 100, offsetWidth: 60, offsetHeight: 40,
    rect: { left: 102, top: 127, width: 75, height: 50 } });
  const inner = el({ rect: { left: 2, top: 2, width: 500, height: 375 }, blocks: [block] });
  const outer = el({ rect: { left: 1, top: 1, width: 200, height: 120 } });
  assert.equal(hitTest(outer, inner, 165, 162), "target");
});

test("after scroll: pre-scroll spot now misses", () => {
  const block = el({ id: "target", offsetLeft: 80, offsetTop: 100, offsetWidth: 60, offsetHeight: 40,
    rect: { left: 62, top: 97, width: 75, height: 50 } });
  const inner = el({ rect: { left: 2, top: 2, width: 500, height: 375 }, blocks: [block] });
  const outer = el({ rect: { left: 1, top: 1, width: 200, height: 120 }, scrollLeft: 40, scrollTop: 30 });
  // (150,160) was inside the no-scroll rect (102..177 x 127..177);
  // after scroll the rect ends at x=137, so the point now misses.
  assert.equal(hitTest(outer, inner, 150, 160), null);
});
