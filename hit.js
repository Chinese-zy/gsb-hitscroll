// Hit test using each block's viewport rect: accounts for ancestor scroll,
// nested offsets and CSS scale without any outer-origin arithmetic.
export function hitTest(outer, inner, clientX, clientY) {
  const blocks = inner.querySelectorAll(".block");
  for (const b of blocks) {
    // Compare in viewport (client) coordinates. getBoundingClientRect of a
    // block already reflects every scroll of any ancestor, nested offsets,
    // and any CSS scale, so no outer-origin math or manual divide is needed.
    const r = b.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.left + r.width &&
        clientY >= r.top && clientY <= r.top + r.height) {
      return b.id || "block";
    }
  }
  return null;
}

if (typeof document !== "undefined") {
  const outer = document.getElementById("outer");
  const inner = document.getElementById("inner");
  const out = document.getElementById("out");
  if (outer) {
    outer.addEventListener("click", (e) => {
      out.textContent = String(hitTest(outer, inner, e.clientX, e.clientY));
    });
  }
}
