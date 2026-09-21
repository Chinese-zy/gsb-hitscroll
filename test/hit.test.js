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
