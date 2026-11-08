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

  // Contact form -> Google Apps Script web app -> Hernan's Gmail.
  // If FORM_ENDPOINT is empty, falls back to opening the visitor's email app.
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbytzl3SzY5ou0Iai8U5D7GwyvdWcLjdsBWT73Ybzi9wwLUxCAADvtl3hLQcslSGJTyJOg/exec';
  var form = document.getElementById('quoteForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, btn = form.querySelector('button[type="submit"]'), status = document.getElementById('formStatus');
    var data = {
      name: f.name.value, email: f.email.value, company: f.company.value,
      service: f.service.value, timeline: f.timeline.value, message: f.message.value,
      website: f.website ? f.website.value : ''
    };
    function show(msg, kind) { status.textContent = msg; status.className = 'form-status ' + (kind || ''); }

    if (!FORM_ENDPOINT) {
      var subject = 'Project inquiry: ' + data.service + ' (' + data.name + ')';
      var body = 'Name: ' + data.name + '\nEmail: ' + data.email + (data.company ? '\nCompany: ' + data.company : '') +
        '\nService: ' + data.service + '\nTimeline: ' + data.timeline + '\n\nProject details:\n' + data.message;
      location.href = 'mailto:uzquianohernan02@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      return;
    }

    btn.disabled = true; btn.dataset.label = btn.dataset.label || btn.innerHTML; btn.textContent = 'Sending…'; show('');
    // text/plain avoids a CORS preflight, which Apps Script does not answer
    fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) { form.reset(); show('Thanks! Your message was sent. I’ll reply to you by email.', 'ok'); }
        else { show((res && res.error) || 'Sending failed. Please email uzquianohernan02@gmail.com directly.', 'err'); }
      })
      .catch(function () { show('Sending failed. Please email uzquianohernan02@gmail.com directly.', 'err'); })
      .then(function () { btn.disabled = false; btn.innerHTML = btn.dataset.label; });
  });

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
