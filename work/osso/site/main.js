const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const desktop = matchMedia('(min-width: 761px)');
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// ---------- Split hero words into letters for a staggered rise ----------
$$('[data-split]').forEach((el, w) => {
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = c;
    s.style.animationDelay = `${1.0 + w * 0.3 + i * 0.06}s`;
    el.appendChild(s);
  });
});

// ---------- Loader: count to 100, then lift away ----------
const count = $('.loader__count');
const finishLoad = () => document.body.classList.add('loaded');
if (reduce) {
  finishLoad();
} else {
  const start = performance.now();
  const dur = 1500;
  (function tick(t) {
    const p = clamp((t - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    count.textContent = String(Math.round(eased * 100)).padStart(3, '0');
    if (p < 1) requestAnimationFrame(tick);
    else finishLoad();
  })(start);
}

// ---------- Reveal + clip-in on scroll ----------
$$('.tile').forEach((t, i) => { t.style.transitionDelay = `${(i % 6) * 0.08}s`; });
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.15 });
$$('.reveal, .clip').forEach((el) => io.observe(el));

// ---------- Statement: split into words, lit up as you scroll ----------
const statement = $('.statement');
const words = [];
(function split(node) {
  [...node.childNodes].forEach((ch) => {
    if (ch.nodeType === 3) {
      const frag = document.createDocumentFragment();
      ch.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(part); return; }
        const w = document.createElement('span');
        w.className = 'w';
        w.textContent = part;
        words.push(w);
        frag.append(w);
      });
      ch.replaceWith(frag);
    } else {
      split(ch);
    }
  });
})(statement);

// ---------- Custom cursor ----------
const dot = $('.cursor');
const ring = $('.cursor-ring');
const ringLabel = ring.querySelector('span');
const useCursor = finePointer && !reduce;
if (useCursor) document.documentElement.classList.add('has-cursor');

document.addEventListener('mouseover', (e) => {
  const t = e.target.closest('a, button, [data-cursor]');
  const label = t && t.dataset.cursor;
  ring.classList.toggle('is-label', !!label);
  ring.classList.toggle('is-link', !!t && !label);
  ringLabel.textContent = label || '';
});

// ---------- Magnetic links ----------
if (useCursor) {
  $$('.nav__link, .nav__logo, .shop, .journal__link').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.35;
      const y = (e.clientY - r.top - r.height / 2) * 0.5;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// ---------- Work index: floating image preview ----------
const preview = $('.preview');
const previewImg = preview.querySelector('img');
let previewOn = false;
if (useCursor) {
  $$('.index a').forEach((a) => {
    a.addEventListener('mouseenter', () => {
      previewImg.src = a.dataset.img;
      preview.classList.add('on');
      previewOn = true;
    });
    a.addEventListener('mouseleave', () => {
      preview.classList.remove('on');
      previewOn = false;
    });
  });
}

// ---------- One animation loop for everything scroll/mouse driven ----------
const nav = $('.nav');
const hero = $('.hero');
const heroMedia = $('.hero__media');
const heroTitle = $('.hero__title');
const collage = $('.collage');
const tiles = $$('.tile');
const journal = $('.journal');
const giant = $('.giant');
const filmImgs = $$('.film__img img');
const contactBg = $('.contact__bg');
const contact = $('.contact');
const track = $('.marquee__track');

let mx = innerWidth / 2, my = innerHeight / 2; // raw mouse
let nmx = 0, nmy = 0;                            // normalised -1..1
let smx = 0, smy = 0;                            // smoothed
let rx = mx, ry = my;                            // ring position
let px = mx, py = my;                            // preview position
let lastY = scrollY, vel = 0, marqueeX = 0;

addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  nmx = (mx / innerWidth) * 2 - 1;
  nmy = (my / innerHeight) * 2 - 1;
}, { passive: true });

const inView = (r) => r.bottom > 0 && r.top < innerHeight;
// 0 when the element's top enters the bottom of the screen, 1 when its bottom leaves the top
const progress = (r) => clamp((innerHeight - r.top) / (innerHeight + r.height));

function frame() {
  const y = scrollY;
  const dy = y - lastY;
  lastY = y;
  vel = lerp(vel, dy, 0.12);
  smx = lerp(smx, nmx, 0.06);
  smy = lerp(smy, nmy, 0.06);

  // nav hides on the way down, returns on the way up
  if (dy > 3 && y > innerHeight * 0.6) nav.classList.add('hide');
  else if (dy < -3 || y < 50) nav.classList.remove('hide');

  // hero: image drifts with the mouse and sinks/zooms on scroll, title lifts and fades
  const h = hero.getBoundingClientRect();
  if (h.bottom > 0) {
    const p = clamp(-h.top / h.height);
    heroMedia.style.transform =
      `translate3d(${smx * -18}px, ${smy * -12 + p * h.height * 0.35}px, 0) scale(${1 + p * 0.12})`;
    heroTitle.style.transform = `translate3d(0, ${p * -140}px, 0)`;
    heroTitle.style.opacity = 1 - p * 1.4;
  }

  // collage: each tile moves at its own depth with scroll and mouse
  if (desktop.matches) {
    const r = collage.getBoundingClientRect();
    if (inView(r)) {
      const offset = r.top + r.height / 2 - innerHeight / 2;
      tiles.forEach((t) => {
        const s = parseFloat(t.dataset.speed);
        const depth = Math.abs(s) * 160;
        t.style.transform = `translate3d(${smx * depth}px, ${offset * s + smy * depth}px, 0)`;
      });
    }
  }

  // statement: words light up one by one
  const sr = statement.getBoundingClientRect();
  if (inView(sr)) {
    const p = clamp((innerHeight * 0.85 - sr.top) / (sr.height + innerHeight * 0.3));
    const lit = p * words.length;
    words.forEach((w, i) => { w.style.opacity = 0.14 + 0.86 * clamp(lit - i); });
  }

  // JOURNAL slides sideways as you pass
  const jr = journal.getBoundingClientRect();
  if (inView(jr)) {
    giant.style.transform = `translate3d(${(0.5 - progress(jr)) * 40}%, 0, 0)`;
  }

  // origin photos: slow zoom-out and drift inside their frame
  filmImgs.forEach((img) => {
    const r = img.parentElement.getBoundingClientRect();
    if (!inView(r)) return;
    const p = progress(r);
    img.style.transform = `translate3d(0, ${(p - 0.5) * -8}%, 0) scale(${1.22 - p * 0.18})`;
  });

  // contact background breathes with scroll
  const cr = contact.getBoundingClientRect();
  if (inView(cr)) contactBg.style.transform = `scale(${1.15 - progress(cr) * 0.15})`;

  // marquee: always moving, speeds up / reverses and skews with scroll velocity
  const half = track.scrollWidth / 2;
  marqueeX -= 0.7 + vel * 0.6;
  if (marqueeX <= -half) marqueeX += half;
  if (marqueeX > 0) marqueeX -= half;
  track.style.transform = `translate3d(${marqueeX}px, 0, 0) skewX(${clamp(-vel * 0.4, -12, 12)}deg)`;

  // cursor + preview follow with easing
  if (useCursor) {
    rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    if (previewOn || preview.classList.contains('on')) {
      px = lerp(px, mx, 0.12); py = lerp(py, my, 0.12);
      preview.style.transform =
        `translate3d(${px + 30}px, ${py}px, 0) translate(0, -50%) rotate(${clamp((mx - px) * 0.06, -10, 10)}deg)`;
    } else {
      px = mx; py = my;
    }
  }

  requestAnimationFrame(frame);
}

if (!reduce) requestAnimationFrame(frame);
