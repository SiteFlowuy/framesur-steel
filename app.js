/* ==========================================================
   FrameSur — app.js
   JavaScript vanilla — esqueleto listo para implementar
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------
  // Lucide icons
  // Inicializa iconos y marca todos los SVG como decorativos
  // (aria-hidden) para que los screen readers los ignoren.
  // ----------------------------------------------------------
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
    // Los SVG generados por Lucide tienen clase "lucide"
    document.querySelectorAll('svg.lucide').forEach((svg) => {
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
    });
  }


  // ----------------------------------------------------------
  // Mobile menu toggle
  // Abre/cierra el nav mobile y convierte hamburger en X
  // ----------------------------------------------------------
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  const closeMobileMenu = () => {
    menuToggle.classList.remove('is-open');
    mobileMenu.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('hidden', !isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cierre al hacer click en cualquier link del menú mobile
    mobileMenu.querySelectorAll('.mobile-menu-link').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
  }


  // ----------------------------------------------------------
  // Navbar scroll shadow
  // Agrega sombra y fondo sólido al navbar al hacer scroll
  // ----------------------------------------------------------
  const navbar = document.getElementById('navbar');

  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('shadow-md', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }


  // ----------------------------------------------------------
  // IntersectionObserver — fade-up
  // Observa elementos con clase .fade-up y agrega .is-visible
  // ----------------------------------------------------------
  const fadeTargets = document.querySelectorAll('.fade-up');

  if (fadeTargets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeTargets.forEach((el) => observer.observe(el));
  }


  // ----------------------------------------------------------
  // Navbar active link highlight (scrollspy)
  // Observa #soluciones, #proyectos, #nosotros, #contacto.
  // Al entrar en viewport agrega text-brand-green al link del
  // navbar desktop (div.hidden.md\:flex) y lo quita de los demás.
  // ----------------------------------------------------------
  const scrollspyIds  = ['soluciones', 'proyectos', 'nosotros', 'contacto'];
  const desktopNav    = document.querySelector('nav[aria-label="Menú principal"]');
  const desktopLinks  = desktopNav
    ? desktopNav.querySelectorAll('[data-nav-link]')
    : [];

  if (desktopLinks.length) {
    const setActiveLink = (id) => {
      desktopLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('text-brand-green', isActive);
        link.classList.toggle('text-brand-muted',  !isActive);
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );

    scrollspyIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }


  // ----------------------------------------------------------
  // Stats counters
  // Anima números desde 0 al target con formato según valor:
  //   8500  → separador de miles con punto  (8.500)
  //   100   → sufijo "%"
  //   resto → sufijo "+"
  // ----------------------------------------------------------
  const statEls = document.querySelectorAll('[data-counter]');

  const formatCounter = (value, target) => {
    if (target === 8500) {
      // Separador de miles con punto (convención uruguaya / española)
      return value.toLocaleString('es-UY').replace(',', '.');
    }
    if (target === 100) return `${value}%`;
    return `${value}+`;
  };

  if (statEls.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el       = entry.target;
          const target   = parseInt(el.dataset.counter, 10);
          const duration = 2000; // ms
          const start    = performance.now();

          const tick = (now) => {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current  = Math.round(eased * target);
            el.textContent = formatCounter(current, target);
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    statEls.forEach((el) => counterObserver.observe(el));
  }


  // ----------------------------------------------------------
  // Sticky CTA mobile
  // Aparece cuando scrollY > 30% del viewport, se oculta en el
  // último 10% de la página (zona de contacto / footer).
  // ----------------------------------------------------------
  const stickyCta = document.getElementById('sticky-cta');

  if (stickyCta) {
    const updateStickyCta = () => {
      const scrollY      = window.scrollY;
      const viewH        = window.innerHeight;
      const docH         = document.documentElement.scrollHeight;
      const threshold    = viewH * 0.3;
      const nearBottom   = scrollY + viewH >= docH * 0.9;

      if (scrollY > threshold && !nearBottom) {
        stickyCta.classList.remove('hidden');
      } else {
        stickyCta.classList.add('hidden');
      }
    };

    window.addEventListener('scroll', updateStickyCta, { passive: true });
    updateStickyCta(); // estado inicial
  }


  // ----------------------------------------------------------
  // FAQ accordion
  // Click en .faq-btn → agrega/quita "is-open" en el .faq-item padre.
  // Solo un item puede estar abierto a la vez.
  // .faq-icon rota 45deg vía CSS cuando el padre tiene is-open.
  // ----------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');

  // Asigna aria-label a cada region FAQ usando el texto de la pregunta
  faqItems.forEach((item) => {
    const questionText = item.querySelector('.faq-btn span')?.textContent?.trim();
    if (questionText) item.setAttribute('aria-label', questionText);
  });

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Cierra todos y actualiza aria-expanded
      faqItems.forEach((i) => {
        i.classList.remove('is-open');
        const b = i.querySelector('.faq-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      // Abre el clickeado si estaba cerrado
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // ----------------------------------------------------------
  // Contact form submit
  // POST a Formspree (contactForm.action). Si ok: oculta form y
  // muestra #contact-success. Si error: reactiva el botón.
  // ----------------------------------------------------------
  const contactForm    = document.getElementById('contact-form');
  const contactSuccess = document.getElementById('contact-success');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn  = contactForm.querySelector('[type="submit"]');
      const originalTxt = submitBtn.textContent;

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Enviando…';

      try {
        const response = await fetch(contactForm.action, {
          method:  'POST',
          body:    new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          contactForm.classList.add('hidden');
          if (contactSuccess) contactSuccess.classList.remove('hidden');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Error. Intentá de nuevo.';
        console.error('[ContactForm]', err);

        // Restaura el texto original tras 3s
        setTimeout(() => {
          submitBtn.textContent = originalTxt;
        }, 3000);
      }
    });
  }

}); // end DOMContentLoaded
