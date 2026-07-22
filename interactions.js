(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  var style = document.createElement('style');
  style.textContent =
    'html{scroll-behavior:smooth;}' +
    '@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto;}}' +
    'a,button{transition:filter 0.25s ease,transform 0.25s ease;}' +
    'a:hover,button:hover{filter:brightness(1.25);}' +
    '[data-framer-background-image-wrapper="true"]{overflow:hidden;}' +
    '[data-framer-background-image-wrapper="true"] img,[data-framer-background-image-wrapper="true"] video{' +
    'transition:transform 0.5s cubic-bezier(.22,.68,0,1.01);}' +
    'a:hover [data-framer-background-image-wrapper="true"] img,' +
    'a:hover [data-framer-background-image-wrapper="true"] video{transform:scale(1.06);}' +
    '.reveal-on-scroll{opacity:0;transform:translateY(24px);transition:opacity 0.7s ease,transform 0.7s ease;}' +
    '.reveal-on-scroll.is-visible{opacity:1;transform:translateY(0);}' +
    '@media (prefers-reduced-motion: reduce){.reveal-on-scroll{opacity:1;transform:none;transition:none;}}' +
    '.cursor-dot{position:fixed;top:0;left:0;width:10px;height:10px;border-radius:50%;' +
    'background:rgba(255,255,255,0.9);pointer-events:none;z-index:999999;mix-blend-mode:difference;' +
    'transform:translate(-50%,-50%);transition:width 0.2s ease,height 0.2s ease,opacity 0.2s ease;opacity:0;}' +
    '.cursor-dot.is-active{opacity:1;}' +
    '.cursor-dot.is-hover{width:32px;height:32px;}';
  document.head.appendChild(style);

  // Fade-up reveal for major sections as they scroll into view
  if (!reduceMotion) {
    var targets = document.querySelectorAll(
      'section:not(#hero-video-section), .svc-row, main > div, footer'
    );
    if ('IntersectionObserver' in window && targets.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
      );
      targets.forEach(function (el) {
        el.classList.add('reveal-on-scroll');
        io.observe(el);
      });
    }
  }

  // Subtle trailing cursor dot, desktop only
  if (finePointer && !reduceMotion) {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    var x = 0, y = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', function (e) {
      x = e.clientX;
      y = e.clientY;
      dot.classList.add('is-active');
    });

    function loop() {
      tx += (x - tx) * 0.2;
      ty += (y - ty) * 0.2;
      dot.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest('a, button')) {
        dot.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest('a, button')) {
        dot.classList.remove('is-hover');
      }
    });
  }
})();
