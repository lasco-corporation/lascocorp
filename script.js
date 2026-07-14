/* ============================================================
   LASCO CORPORATION — Interactions et animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Preloader ---------- */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => preloader.classList.add('hidden'), 500);
        });
        // Sécurité : on le masque après 2,5 s même si une image traîne
        setTimeout(() => preloader.classList.add('hidden'), 2500);
    }

    /* ---------- Navbar au défilement ---------- */
    const header = document.getElementById('header');
    const backTop = document.getElementById('backTop');

    const onScroll = () => {
        const y = window.scrollY;
        if (header) header.classList.toggle('scrolled', y > 40);
        if (backTop) backTop.classList.toggle('visible', y > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backTop) {
        backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ---------- Menu mobile ---------- */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });
    }

    /* ---------- Lien actif selon la section visible ---------- */
    const sections = document.querySelectorAll('section[id]');
    const menuAnchors = navLinks ? navLinks.querySelectorAll('a[href^="#"]') : [];
    if (sections.length && menuAnchors.length) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    menuAnchors.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(s => spy.observe(s));
    }

    /* ---------- Apparition au défilement ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
        const revealObs = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        // Petit décalage en cascade pour les éléments voisins
        reveals.forEach((el, i) => {
            el.style.transitionDelay = (i % 4) * 0.1 + 's';
            revealObs.observe(el);
        });
    }

    /* ---------- Compteurs animés ---------- */
    const counters = document.querySelectorAll('.counter');
    if (counters.length) {
        const fmt = new Intl.NumberFormat('fr-CA');
        // Les valeurs finales sont dans le HTML (repli sans JS) : on repart de zéro
        counters.forEach(c => c.textContent = '0');
        const runCounter = el => {
            const target = parseInt(el.dataset.target, 10);
            const duration = 2000;
            const start = performance.now();
            const tick = now => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
                el.textContent = fmt.format(Math.round(target * eased));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        const countObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounter(entry.target);
                    countObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach(c => countObs.observe(c));
    }

    /* ---------- Carrousel de témoignages ---------- */
    const slides = document.querySelectorAll('.t-slide');
    const dotsWrap = document.getElementById('tDots');
    if (slides.length && dotsWrap) {
        let current = 0;
        let timer;

        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 't-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Témoignage ' + (i + 1));
            dot.addEventListener('click', () => { goTo(i); restart(); });
            dotsWrap.appendChild(dot);
        });
        const dots = dotsWrap.querySelectorAll('.t-dot');

        const goTo = i => {
            slides[current].classList.remove('active');
            dots[current].classList.remove('active');
            current = i;
            slides[current].classList.add('active');
            dots[current].classList.add('active');
        };
        const next = () => goTo((current + 1) % slides.length);
        const restart = () => { clearInterval(timer); timer = setInterval(next, 6000); };
        restart();
    }

    /* ---------- Accordéon FAQ ---------- */
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-q');
        btn.addEventListener('click', () => {
            const wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
            if (!wasOpen) item.classList.add('open');
        });
    });

    /* ---------- Formulaire de soumission ---------- */
    // Collez ici l'URL de votre webhook (n8n, Formspree, etc.) pour recevoir
    // réellement les demandes. Laissez vide = mode démonstration (aucun envoi).
    // Exemple n8n : const FORM_WEBHOOK_URL = 'https://n8n.mondomaine.com/webhook/lasco-soumission';
    const FORM_WEBHOOK_URL = '';

    const form = document.getElementById('quoteForm');
    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const success = document.getElementById('formSuccess');
            const btn = form.querySelector('button[type="submit"]');

            if (FORM_WEBHOOK_URL) {
                const data = Object.fromEntries(new FormData(form).entries());
                data.date = new Date().toISOString();
                data.source = location.href;
                btn.disabled = true;
                btn.textContent = 'Envoi en cours…';
                try {
                    const res = await fetch(FORM_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                } catch (err) {
                    alert("L'envoi a échoué. Veuillez réessayer ou nous appeler au +1 (418) 555-7890.");
                    return;
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Envoyer ma demande';
                }
            }

            if (success) success.classList.add('visible');
            form.reset();
            setTimeout(() => success && success.classList.remove('visible'), 8000);
        });
    }

    /* ---------- Année courante ---------- */
    document.querySelectorAll('#year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    /* ---------- Particules dorées du hero ---------- */
    const canvas = document.getElementById('particles');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (canvas && !reduceMotion) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let w, h;

        const resize = () => {
            const hero = canvas.parentElement;
            w = canvas.width = hero.offsetWidth;
            h = canvas.height = hero.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const COUNT = Math.min(70, Math.floor(window.innerWidth / 18));
        for (let i = 0; i < COUNT; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                r: Math.random() * 2.2 + 0.6,
                vy: -(Math.random() * 0.35 + 0.1),
                vx: (Math.random() - 0.5) * 0.15,
                alpha: Math.random() * 0.5 + 0.15,
                twinkle: Math.random() * 0.02 + 0.005
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.y += p.vy;
                p.x += p.vx;
                p.alpha += p.twinkle;
                if (p.alpha > 0.7 || p.alpha < 0.1) p.twinkle *= -1;
                if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(212, 175, 55, ' + Math.max(p.alpha, 0.05).toFixed(3) + ')';
                ctx.shadowColor = 'rgba(212, 175, 55, .8)';
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            requestAnimationFrame(draw);
        };
        draw();
    }

});
