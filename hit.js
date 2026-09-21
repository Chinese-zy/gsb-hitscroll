// BUG: ignores scroll offset; nested uses outer origin; scale not divided.
export function hitTest(outer, inner, clientX, clientY) {
  const or = outer.getBoundingClientRect();
  // BUG: use client coords minus outer left/top only (pre-scroll position).
  const x = clientX - or.left;
  const y = clientY - or.top;
  const blocks = inner.querySelectorAll(".block");
  for (const b of blocks) {
    const br = b.getBoundingClientRect();
    // BUG: compare against layout without scroll/scale correction using outer origin.
    if (x >= b.offsetLeft && x <= b.offsetLeft + b.offsetWidth &&
        y >= b.offsetTop && y <= b.offsetTop + b.offsetHeight) {
      return b.id || "block";
    }
    void br;
  }
  return null;
}

const outer = document.getElementById("outer");
const inner = document.getElementById("inner");
const out = document.getElementById("out");
if (outer) {
  outer.addEventListener("click", (e) => {
    out.textContent = String(hitTest(outer, inner, e.clientX, e.clientY));
  });
}
