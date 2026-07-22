(function () {
  var THEME_KEY = 'wale-theme';

  var style = document.createElement('style');
  style.textContent =
    'html.light-mode{filter:invert(1) hue-rotate(180deg);background:#fff;}' +
    'html.light-mode img,html.light-mode video,html.light-mode source,html.light-mode picture{' +
    'filter:invert(1) hue-rotate(180deg);}' +
    '.theme-toggle-btn{width:40px;height:24px;border-radius:12px;background:rgba(255,255,255,0.15);' +
    'border:1px solid rgba(255,255,255,0.3);cursor:pointer;display:inline-flex;align-items:center;' +
    'padding:2px;margin-left:16px;flex:none;vertical-align:middle;}' +
    '.theme-toggle-btn .knob{width:18px;height:18px;border-radius:50%;background:#fff;' +
    'transition:transform 0.2s ease;}' +
    'html.light-mode .theme-toggle-btn .knob{transform:translateX(16px);}';
  document.head.appendChild(style);

  function makeButton() {
    var btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle light/dark theme');
    var knob = document.createElement('span');
    knob.className = 'knob';
    btn.appendChild(knob);
    btn.addEventListener('click', function () {
      var isLight = document.documentElement.classList.toggle('light-mode');
      try {
        localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
      } catch (e) {}
    });
    return btn;
  }

  function mount() {
    var navs = document.querySelectorAll('nav');
    if (!navs.length) {
      document.body.appendChild(makeButton());
      return;
    }
    navs.forEach(function (nav) {
      nav.appendChild(makeButton());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
