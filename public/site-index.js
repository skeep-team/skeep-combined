(function () {
  'use strict';

  if (window.self !== window.top || document.querySelector('.skeep-site-index')) return;
  if (new URLSearchParams(window.location.search).has('embed')) return;

  var path = window.location.pathname.replace(/\/$/, '') || '/';
  var basePath = path === '/skeep-combined' || path.indexOf('/skeep-combined/') === 0 ? '/skeep-combined' : '';
  var relativePath = basePath ? path.slice(basePath.length) || '/' : path;
  // 로컬 파일(file://)로 열었을 때: 3개 정적 페이지는 같은 폴더 상대경로로 연결,
  // 허브·Next 라우트는 서버가 있어야 동작하므로 비활성 처리. 배포(웹서버)에선 원래대로.
  var isFile = window.location.protocol === 'file:';
  var items = [
    { label: '인덱스', href: isFile ? '' : basePath + '/', match: ['/'], disabled: isFile },
    { label: '오버뷰', href: isFile ? 'index.html' : basePath + '/pages/index.html', match: ['/pages/index.html'] },
    { label: '새겨듣다', href: isFile ? 'saegyeodeutda.html' : basePath + '/pages/saegyeodeutda.html', match: ['/pages/saegyeodeutda.html'] },
    { label: '스며들다', href: isFile ? 'smeureulda.html' : basePath + '/pages/smeureulda.html', match: ['/pages/smeureulda.html'] },
    { label: '조율하다', href: isFile ? '' : basePath + '/negotiation', match: ['/negotiation'], disabled: isFile },
    { label: '빌려쓰다', href: isFile ? '' : basePath + '/principles', match: ['/principles'], disabled: isFile },
    { label: '지켜주다', href: isFile ? '' : basePath + '/service2', match: ['/service2'], disabled: isFile },
    { label: '기억하다', href: isFile ? '' : basePath + '/service3', match: ['/service3'], disabled: isFile },
    { label: '비즈니스', href: '', match: ['/business'], disabled: true }
  ];

  var activeIndex = items.findIndex(function (item) {
    return item.match.some(function (candidate) {
      return relativePath === candidate || relativePath.indexOf(candidate + '/') === 0;
    });
  });
  if (activeIndex < 0) activeIndex = 0;

  var nav = document.createElement('nav');
  nav.className = 'skeep-site-index';
  nav.setAttribute('aria-label', 'Skeep 페이지 인덱스');
  nav.innerHTML = [
    '<button class="skeep-site-index__compact" type="button" aria-label="페이지 인덱스 열기" aria-expanded="false">',
    '<span class="skeep-site-index__markers" aria-hidden="true">',
    items.map(function (_, index) { return '<span class="skeep-site-index__marker' + (index === activeIndex ? ' is-active' : '') + '"></span>'; }).join(''),
    '</span></button>',
    '<div class="skeep-site-index__expanded" aria-hidden="true">',
    '<ul class="skeep-site-index__list">',
    items.map(function (item, index) {
      var active = index === activeIndex ? ' is-active' : '';
      var current = index === activeIndex ? ' aria-current="page"' : '';
      if (item.disabled) return '<li><button class="skeep-site-index__link' + active + '" type="button" aria-disabled="true">' + item.label + '</button></li>';
      return '<li><a class="skeep-site-index__link' + active + '" href="' + item.href + '"' + current + '>' + item.label + '</a></li>';
    }).join(''),
    '</ul></div>'
  ].join('');
  document.body.appendChild(nav);

  var compact = nav.querySelector('.skeep-site-index__compact');
  var expanded = nav.querySelector('.skeep-site-index__expanded');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var scrollThreshold = Math.min(180, Math.max(72, window.innerHeight * .12));
  var open = false;
  var visible = false;
  var hasScrollIntent = false;
  var touchStartY = 0;
  var focusTimer = 0;

  function setOpen(next, returnFocus) {
    open = Boolean(next && visible);
    nav.classList.toggle('is-open', open);
    compact.setAttribute('aria-expanded', String(open));
    expanded.setAttribute('aria-hidden', String(!open));
    window.clearTimeout(focusTimer);
    if (open) {
      focusTimer = window.setTimeout(function () {
        var activeLink = nav.querySelector('.skeep-site-index__link.is-active');
        (activeLink || nav.querySelector('.skeep-site-index__link')).focus({ preventScroll: true });
      }, reduceMotion.matches ? 0 : 360);
    } else if (returnFocus && visible) {
      compact.focus({ preventScroll: true });
    }
  }

  function updateVisibility() {
    var nextVisible = hasScrollIntent || window.scrollY > scrollThreshold;
    if (nextVisible === visible) return;
    visible = nextVisible;
    nav.classList.toggle('is-visible', visible);
    if (!visible) setOpen(false, false);
  }

  compact.addEventListener('click', function () { setOpen(true, false); });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('[aria-disabled="true"]')) event.preventDefault();
  });
  document.addEventListener('pointerdown', function (event) {
    if (open && !nav.contains(event.target)) setOpen(false, false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && open) setOpen(false, true);
  });
  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('wheel', function (event) {
    if (event.deltaY > 6 && !hasScrollIntent) {
      hasScrollIntent = true;
      updateVisibility();
    }
  }, { passive: true });
  window.addEventListener('touchstart', function (event) {
    touchStartY = event.touches[0] ? event.touches[0].clientY : 0;
  }, { passive: true });
  window.addEventListener('touchmove', function (event) {
    var touch = event.touches[0];
    if (touch && touchStartY - touch.clientY > 10 && !hasScrollIntent) {
      hasScrollIntent = true;
      updateVisibility();
    }
  }, { passive: true });
  window.addEventListener('resize', function () {
    scrollThreshold = Math.min(180, Math.max(72, window.innerHeight * .12));
    updateVisibility();
  }, { passive: true });
  updateVisibility();
})();
