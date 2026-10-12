// Work page: filter projects by type.
// Each project's types are keyed by its folder name under /work/.
(function () {
  var TYPES = [
    { id: 'all', label: 'All' },
    { id: 'web-design', label: 'Web Design' },
    { id: 'branding', label: 'Branding' },
    { id: 'print', label: 'Print & Packaging' },
    { id: 'motion', label: 'Motion & Animation' },
    { id: 'social', label: 'Social & Content' },
    { id: 'digital', label: 'Digital' },
    { id: 'personal', label: 'Personal' }
  ];
  var PROJECTS = {
    'osso': ['web-design', 'motion'],
    'one-night': ['web-design', 'motion'],
    'vernholt': ['web-design', 'motion'],
    'the-burman-hotel': ['branding', 'print'],
    'chesterfield': ['print', 'digital'],
    'gtbank-fashion-weekend': ['motion'],
    'divest': ['social', 'digital'],
    'nano-banana': ['personal'],
    'reloc8-copy': ['branding'],
    'uba-mobile-app': ['motion'],
    'fund-727': ['motion'],
    'reloc8': ['branding'],
    'guava': ['branding', 'print'],
    'gtbank-pension': ['digital']
  };

  var css = document.createElement('style');
  css.textContent =
    '.work-filter{display:flex;flex-wrap:wrap;gap:8px 28px;width:100%;margin:0 0 60px;' +
    'font-family:"Mona Sans",sans-serif;font-size:17px;font-weight:500;line-height:1.3;font-feature-settings:"ss01","tnum";}' +
    '.work-filter button{all:unset;cursor:pointer;color:rgba(255,255,255,0.6);transition:color .2s;}' +
    '.work-filter button:hover,.work-filter button[aria-pressed="true"]{color:#fff;}' +
    '.work-filter button:focus-visible{outline:1px solid #fff;outline-offset:4px;}' +
    '.work-filter sup{font-size:11px;margin-left:3px;vertical-align:top;position:relative;top:-2px;}' +
    '.work-filtered [data-framer-name="Media"]{aspect-ratio:4/3 !important;}' +
    '.work-card-in{animation:workCardIn .5s cubic-bezier(.2,.7,.2,1) both;}' +
    '@keyframes workCardIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){.work-card-in{animation:none}}';
  document.head.appendChild(css);

  var current = 'all';

  function cards() {
    return Array.prototype.map.call(document.querySelectorAll('.framer-1kcc1w5-container'), function (el) {
      var a = el.querySelector('a[href*="work/"]');
      var m = a && a.getAttribute('href').match(/work\/([^/]+)\//);
      if (el.dataset.span === undefined) el.dataset.span = el.style.getPropertyValue('--1q1styz');
      return { el: el, types: (m && PROJECTS[m[1]]) || [] };
    });
  }

  function apply(id, animate) {
    current = id;
    var grid = document.querySelector('section[data-framer-name="Projects"]');
    if (grid) grid.classList.toggle('work-filtered', id !== 'all');
    cards().forEach(function (c) {
      var show = id === 'all' || c.types.indexOf(id) > -1;
      c.el.style.display = show ? '' : 'none';
      c.el.style.setProperty('--1q1styz', id === 'all' ? c.el.dataset.span : 'span 3');
      c.el.classList.remove('work-card-in');
      if (show && animate) { void c.el.offsetWidth; c.el.classList.add('work-card-in'); }
    });
    document.querySelectorAll('.work-filter button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.type === id));
    });
  }

  function build() {
    var grid = document.querySelector('section[data-framer-name="Projects"]');
    if (!grid || document.querySelector('.work-filter')) return;
    var list = cards();
    var bar = document.createElement('div');
    bar.className = 'work-filter';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filter projects by type');
    TYPES.forEach(function (t) {
      var n = t.id === 'all' ? list.length : list.filter(function (c) { return c.types.indexOf(t.id) > -1; }).length;
      if (!n) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.type = t.id;
      b.innerHTML = t.label + '<sup>' + n + '</sup>';
      b.addEventListener('click', function () {
        if (history.replaceState) history.replaceState(null, '', t.id === 'all' ? location.pathname : '#' + t.id);
        apply(t.id, true);
      });
      bar.appendChild(b);
    });
    grid.parentNode.insertBefore(bar, grid);
    apply(current, false);
  }

  function start() {
    var fromHash = location.hash.slice(1);
    if (TYPES.some(function (t) { return t.id === fromHash; })) current = fromHash;
    build();
    // Framer hydrates after load and can re-render the page; put the bar back if it disappears.
    new MutationObserver(function () {
      if (!document.querySelector('.work-filter')) build();
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
