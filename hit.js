export function hitTest(outer, inner, clientX, clientY) {
  const blocks = inner.querySelectorAll(".block");
  for (const b of blocks) {
    const br = b.getBoundingClientRect();
    if (clientX >= br.left && clientX <= br.left + br.width &&
        clientY >= br.top && clientY <= br.top + br.height) {
      return b.id || "block";
    }
  }
  return null;
}

const hasDOM = typeof document !== "undefined";
const outer = hasDOM ? document.getElementById("outer") : null;
const inner = hasDOM ? document.getElementById("inner") : null;
const out = hasDOM ? document.getElementById("out") : null;
const overlay = hasDOM ? document.getElementById("overlay") : null;

function showOffset(badX, badY, goodX, goodY) {
  if (!overlay) return;
  overlay.innerHTML =
    `<line x1="${badX}" y1="${badY}" x2="${goodX}" y2="${goodY}" class="offset-line"/>` +
    `<circle cx="${badX}" cy="${badY}" r="4" class="mark-bad"/>` +
    `<circle cx="${goodX}" cy="${goodY}" r="4" class="mark-good"/>`;
}

if (outer) {
  outer.addEventListener("click", (e) => {
    const result = hitTest(outer, inner, e.clientX, e.clientY);
    out.textContent = String(result);
    for (const b of inner.querySelectorAll(".block")) {
      b.classList.toggle("hit", (b.id || "block") === result);
    }
    // 红点:旧算法(不补滚动、不除缩放)算出的落点;绿点:修正后的落点;连线即偏出去的那一截。
    const or = outer.getBoundingClientRect();
    const ir = inner.getBoundingClientRect();
    const scale = ir.width / inner.offsetWidth || 1;
    showOffset(e.clientX - or.left, e.clientY - or.top,
      (e.clientX - ir.left) / scale, (e.clientY - ir.top) / scale);
  });
}
