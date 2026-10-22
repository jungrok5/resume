// Ownership mark for a piece opened on its own page. Inside the résumé (?embed) the host page draws the mark over the stage.
(function () {
  if (/[?&](embed|render)\b/.test(location.search)) return;
  var stage = document.querySelector('.stage');
  if (stage) {
    var m = document.createElement('div');
    m.textContent = '© 오정록 · 무단 사용 금지';
    m.setAttribute('aria-hidden', 'true');
    m.style.cssText = 'position:absolute;top:10px;right:12px;z-index:5;pointer-events:none;font:500 12px/1.2 system-ui,-apple-system,sans-serif;' +
      'color:rgba(255,255,255,.6);text-shadow:0 1px 2px rgba(0,0,0,.7)';
    if (getComputedStyle(stage).position === 'static') stage.style.position = 'relative';
    stage.appendChild(m);
    stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  var notes = document.querySelector('.notes');
  if (notes) {
    var p = document.createElement('p');
    p.textContent = '© 2026 오정록 (Jeongrok Oh). 이 모션 그래픽과 글은 저작권으로 보호됩니다. 허락 없이 복제, 녹화, 재사용, 재배포할 수 없습니다.';
    p.style.cssText = 'opacity:.7;font-size:13px;margin-top:24px';
    notes.appendChild(p);
  }
})();
