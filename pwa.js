// PWA: service worker + an "install app" toast (Android/desktop Chrome); iOS gets a one-time hint.
(function () {
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((r) => r.update()).catch(() => {});
    let reloaded = false;                                   // a new version took over: reload once so old and new files never mix
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded && navigator.serviceWorker.controller) { reloaded = true; location.reload(); } });
  }
  const en = () => (window.LANG || (localStorage.getItem('hk15_lang') || 'th')) === 'en';
  const seen = () => { try { return localStorage.getItem('hk15_pwa') === 'no'; } catch (e) { return false; } };
  function toast(txt, btn, onBtn) {
    if (seen() || document.getElementById('pwaToast')) return;
    const t = document.createElement('div'); t.id = 'pwaToast';
    t.innerHTML = `<img src="icons/icon-192.png" alt=""><div><b>${en() ? 'Install the app' : 'ติดตั้งแอป'}</b><small>${txt}</small></div>` +
      (btn ? `<button class="go">${btn}</button>` : '') + `<button class="x">${en() ? 'Later' : 'ไว้ก่อน'}</button>`;
    Object.assign(t.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: 60, display: 'flex', gap: '12px', alignItems: 'center', maxWidth: 'calc(100% - 32px)',
      padding: '12px 14px', borderRadius: '20px', background: 'var(--panel, #fff)', color: 'var(--text, #1d1b3a)', boxShadow: '0 14px 40px rgba(40,30,120,.2)',
      font: '14px/1.35 Anuphan, system-ui, sans-serif', animation: 'pwaIn .5s cubic-bezier(.34,1.56,.64,1)' });
    const st = document.createElement('style');
    st.textContent = '@keyframes pwaIn{from{transform:translateY(30px);opacity:0}}#pwaToast img{width:40px;height:40px;border-radius:12px}#pwaToast small{display:block;color:var(--muted,#6f7392)}' +
      '#pwaToast button{border:0;border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}#pwaToast .go{background:#10b981;color:#fff}#pwaToast .x{background:transparent;color:var(--muted,#6f7392)}';
    document.head.appendChild(st); document.body.appendChild(t);
    t.querySelector('.x').onclick = () => { t.remove(); try { localStorage.setItem('hk15_pwa', 'no'); } catch (e) {} };
    if (btn) t.querySelector('.go').onclick = () => { t.remove(); onBtn(); };
  }
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setTimeout(() => toast(en() ? 'Open it like an app, works offline' : 'เปิดเหมือนแอป ใช้ได้แม้ไม่มีเน็ต', en() ? 'Install' : 'ติดตั้ง', () => e.prompt()), 6000);
  });
  const ios = /iphone|ipad/i.test(navigator.userAgent) && !navigator.standalone;
  if (ios) setTimeout(() => toast(en() ? 'Tap Share → Add to Home Screen' : 'แตะ แชร์ → เพิ่มไปยังหน้าจอโฮม'), 8000);
})();
