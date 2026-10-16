// ?debug=1 → small overlay: frame rate, longest blocking tasks (with what was on screen), browser, cache version.
(function () {
  if (!/[?&]debug=1/.test(location.search)) return;
  const box = document.createElement('div');
  Object.assign(box.style, { position: 'fixed', left: '8px', top: '8px', zIndex: 9999, background: 'rgba(20,20,40,.88)', color: '#fff', font: '11px/1.4 monospace',
    padding: '8px 10px', borderRadius: '10px', maxWidth: '92vw', pointerEvents: 'none', whiteSpace: 'pre-wrap' });
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  const lt = []; let frames = 0, fps = 0, t0 = performance.now(), worstGap = 0, last = performance.now();
  const where = () => { const b = document.querySelector('#tabs button.on'); return b ? b.dataset.t : location.pathname.split('/').pop() || 'index'; };
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { lt.push([Math.round(e.duration), where()]); lt.sort((a, b) => b[0] - a[0]); lt.length = Math.min(lt.length, 5); })).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  (function f() { const n = performance.now(); worstGap = Math.max(worstGap, n - last); last = n; frames++;
    if (n - t0 > 1000) { fps = frames; frames = 0; t0 = n; } requestAnimationFrame(f); })();
  setInterval(async () => {
    let sw = '-'; try { const k = await caches.keys(); sw = k.join(','); } catch (e) {}
    const mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) + ' MB' : '-';
    box.textContent = `fps ${fps} · worst frame gap ${Math.round(worstGap)} ms · tab ${where()}\nlong tasks: ${lt.map((x) => x[0] + 'ms@' + x[1]).join(' ') || 'none'}\nheap ${mem} · cache ${sw}\n${navigator.userAgent.slice(0, 120)}`;
  }, 1000);
})();
