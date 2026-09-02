(() => {
'use strict';
if (window.__gtaFrontDoor31A6) return;
window.__gtaFrontDoor31A6 = true;
function front() { return document.getElementById('build11-front'); }
function enterButton() { return document.getElementById('enter-city'); }
function removeFrontDoor() {
  const el = front();
  if (!el) return false;
  el.remove();
  const d = document.getElementById('detail');
  if (d && !d.textContent.includes('CARDINAL WALK')) d.textContent = '31A.6 · CARDINAL PLAYER TEST · F1 VECTOR / F2 BITMAP';
  return true;
}
document.addEventListener('pointerdown', e => {
  const target = e.target instanceof Element ? e.target.closest('#enter-city') : null;
  if (!target) return;
  e.preventDefault(); e.stopPropagation(); removeFrontDoor();
}, true);
document.addEventListener('click', e => {
  const target = e.target instanceof Element ? e.target.closest('#enter-city') : null;
  if (!target) return;
  e.preventDefault(); e.stopPropagation(); removeFrontDoor();
}, true);
document.addEventListener('keydown', e => {
  if ((e.code === 'Enter' || e.code === 'Space') && front() && enterButton()) {
    e.preventDefault(); removeFrontDoor();
  }
}, true);
const observer = new MutationObserver(() => {
  const el = front();
  if (!el) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue) continue;
    node.nodeValue = node.nodeValue
      .replace(/BUILD 28/g, 'BUILD 31A.6')
      .replace(/BUILD 29/g, 'BUILD 31A.6')
      .replace(/BUILD 31A\.1/g, 'BUILD 31A.6')
      .replace(/BUILD 31A\.3/g, 'BUILD 31A.6')
      .replace(/BUILD 31A\.4/g, 'BUILD 31A.6')
      .replace(/BUILD 31A\.5/g, 'BUILD 31A.6');
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });
})();
