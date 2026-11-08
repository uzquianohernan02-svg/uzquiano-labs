(function () {
  var root = document.documentElement;

  // Theme toggle (remembered per browser; storage may be unavailable)
  try { var saved = localStorage.getItem('ul-theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ul-theme', next); } catch (e) {}
  });

  // Mobile menu
  var menuBtn = document.getElementById('menuBtn'), links = document.getElementById('navLinks');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Nav border + active link
  var nav = document.getElementById('nav');
  var anchors = links ? links.querySelectorAll('a[href^="#"]') : [];
  var targets = Array.prototype.map.call(anchors, function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', scrollY > 8);
    var pos = scrollY + 130, active = -1;
    targets.forEach(function (t, i) { if (t && t.offsetTop <= pos) active = i; });
    Array.prototype.forEach.call(anchors, function (a, i) { a.classList.toggle('active', i === active); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Service "Request a quote" links preselect the service in the form
  document.querySelectorAll('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = document.getElementById('f-service');
      if (sel) sel.value = a.getAttribute('data-service');
    });
  });

  // Contact form -> opens the visitor's email app (no server, nothing stored)
  var form = document.getElementById('quoteForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var subject = 'Project inquiry: ' + f.service.value + ' (' + f.name.value + ')';
    var body = 'Name: ' + f.name.value + '\nEmail: ' + f.email.value +
      (f.company.value ? '\nCompany: ' + f.company.value : '') +
      '\nService: ' + f.service.value + '\nTimeline: ' + f.timeline.value +
      '\n\nProject details:\n' + f.message.value;
    location.href = 'mailto:uzquianohernan02@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
