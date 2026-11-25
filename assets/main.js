(() => {
  const doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = window.gsap && window.ScrollTrigger;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* Smooth scroll */
  let lenis;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* Nav state */
  const nav = document.querySelector('.nav');
  const heroEl = document.querySelector('.hero, .phero');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY, h = heroEl ? heroEl.offsetHeight - 90 : 10;
    nav.classList.toggle('is-solid', y > h);
    const darkSec = [...document.querySelectorAll('[data-nav-dark]')].some(s => { const r = s.getBoundingClientRect(); return r.top < 60 && r.bottom > 60; });
    nav.classList.toggle('is-dark', y > h && darkSec);
    nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 1.2 && !doc.classList.contains('menu-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Mobile menu */
  const burger = document.querySelector('.burger');
  burger && burger.addEventListener('click', () => { const o = doc.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', o); o ? lenis?.stop() : lenis?.start(); });
  document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', () => { doc.classList.remove('menu-open'); lenis?.start(); }));

  /* Accordion */
  document.querySelectorAll('.acc__btn').forEach(b => b.addEventListener('click', () => {
    const acc = b.closest('.acc'); const open = !acc.classList.contains('open');
    acc.parentElement.querySelectorAll('.acc.open').forEach(x => { x.classList.remove('open'); x.querySelector('.acc__btn').setAttribute('aria-expanded', 'false'); });
    if (open) { acc.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    setTimeout(() => hasGsap && ScrollTrigger.refresh(), 750);
  }));

  /* Cursor image for areas */
  const ci = document.querySelector('.cursor-img');
  if (ci && matchMedia('(hover:hover)').matches) {
    const imgs = [...ci.querySelectorAll('img')];
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, active = false, s = .6;
    document.querySelectorAll('.area').forEach((row, i) => {
      row.addEventListener('mouseenter', () => { active = true; imgs.forEach((im, j) => im.classList.toggle('on', j === i)); ci.style.opacity = 1; });
      row.addEventListener('mouseleave', () => { active = false; ci.style.opacity = 0; });
    });
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    const loop = () => { cx += (x - cx) * .12; cy += (y - cy) * .12; s += ((active ? 1 : .6) - s) * .1;
      const rot = (x - cx) * .04; ci.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%) scale(${s}) rotate(${rot}deg)`; requestAnimationFrame(loop); };
    loop();
  }

  /* Counters */
  const count = el => {
    const end = parseFloat(el.dataset.count), dur = 1800, t0 = performance.now();
    const fmt = n => Math.round(n).toLocaleString('nb-NO').replace(/ /g, ' ');
    const step = t => { const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(end * e); if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end); };
    reduce ? (el.textContent = fmt(end)) : requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); io.unobserve(e.target); } }), { threshold: .4 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));

  /* TOC highlight */
  const tocLinks = [...document.querySelectorAll('.toc a')];
  if (tocLinks.length) {
    const tio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) tocLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.prose h2[id]').forEach(h => tio.observe(h));
  }

  /* Loader + intro */
  const loader = document.querySelector('.loader');
  const intro = () => {
    if (!hasGsap || reduce) { loader && loader.remove(); document.querySelectorAll('[data-fade]').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); return; }
    const tl = gsap.timeline();
    if (loader && !sessionStorageSeen()) {
      tl.fromTo('.loader svg', { rotate: -120, scale: .6, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'expo.out' })
        .from('.loader__word span', { yPercent: 110, duration: .9, ease: 'expo.out' }, '-=.7')
        .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '+=.25')
        .add(() => loader.remove());
    } else if (loader) loader.remove();
    tl.from('.hero__media, .phero > img', { scale: 1.18, duration: 2.2, ease: 'expo.out' }, loader ? '-=.8' : 0)
      .from('.hero h1 .line > span, .phero h1 .line > span', { yPercent: 110, duration: 1.3, stagger: .09, ease: 'expo.out' }, '<.15')
      .from('.hero__side > *, .phero__in .lead, .crumbs, .nav', { opacity: 0, y: 24, duration: 1, stagger: .08, ease: 'expo.out' }, '<.35');
  };
  function sessionStorageSeen() { try { const s = sessionStorage.getItem('staf-seen'); sessionStorage.setItem('staf-seen', '1'); return !!s; } catch (e) { return false; } }

  if (hasGsap && !reduce) {
    /* enter animations via IntersectionObserver (robust against layout shifts) */
    const onEnter = (els, fromVars, toVars, group) => {
      els = gsap.utils.toArray(els); if (!els.length) return;
      gsap.set(els, fromVars);
      const obs = new IntersectionObserver(es => {
        const vis = es.filter(e => e.isIntersecting).map(e => e.target); if (!vis.length) return;
        vis.forEach(t => obs.unobserve(t));
        gsap.to(vis, { ...toVars, stagger: group ? .09 : 0, overwrite: true });
      }, { rootMargin: '0px 0px -8% 0px' });
      els.forEach(e => obs.observe(e));
    };
    onEnter('[data-fade]', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' });
    onEnter('.area', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' });
    onEnter('.num', { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, true);
    onEnter('.goal', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, true);
    document.querySelectorAll('img').forEach(im => im.complete || im.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }));
    addEventListener('load', () => ScrollTrigger.refresh());
    /* hero parallax */
    const hm = document.querySelector('.hero__media');
    hm && gsap.to(hm, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    const pimg = document.querySelector('.phero > img');
    pimg && gsap.to(pimg, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } });
    /* statement words */
    const st = document.querySelector('.statement p[data-words]');
    if (st) {
      st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
      gsap.to(st.querySelectorAll('.w'), { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    }
    /* image reveal */
    document.querySelectorAll('.reveal-img').forEach(r => {
      gsap.to(r, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: r, start: 'top 90%', end: 'center 55%', scrub: true } });
      gsap.fromTo(r.querySelector('img'), { yPercent: -14 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: r, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    /* inner parallax in frames */
    gsap.utils.toArray('.careers__grid figure img, .depts__media img, .feature .frame img').forEach(img => {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    /* story */
    const story = document.querySelector('.story');
    if (story && innerWidth > 760) {
      gsap.to('.story__pin > img', { scale: 1, ease: 'none', scrollTrigger: { trigger: story, start: 'top bottom', end: 'bottom bottom', scrub: true } });
      onEnter('.story__card > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, true);
    }
    /* gateway */
    const gw = document.querySelector('.gateway > img');
    gw && gsap.fromTo(gw, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.gateway', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  const start = () => { intro(); hasGsap && ScrollTrigger.refresh(); };
  document.fonts && document.fonts.ready ? document.fonts.ready.then(start) : addEventListener('load', start);

  /* Ensure hero video plays (Chrome/Firefox) */
  const v = document.querySelector('.hero video');
  if (v) { v.muted = true; const p = v.play(); p && p.catch(() => {}); }
})();
