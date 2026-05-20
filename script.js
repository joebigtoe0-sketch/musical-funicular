document.addEventListener("DOMContentLoaded", () => {

  // ─── Calendly booking links (data-calendly) ──────────────────
  const calendlyUrl = window.SAIRAS_CALENDLY_URL;
  if (calendlyUrl) {
    document.querySelectorAll("[data-calendly]").forEach((el) => {
      if (el instanceof HTMLAnchorElement) {
        el.href = calendlyUrl;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      }
    });
  }

  // ─── Mobile nav toggle ───────────────────────────────────────
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navMenu.addEventListener("click", (e) => {
      if (e.target instanceof HTMLElement && e.target.tagName === "A") {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ─── Year ────────────────────────────────────────────────────
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  // ─── Scroll animations ───────────────────────────────────────
  const revealEls = document.querySelectorAll(
    ".service-card, .portfolio-item, .why-card, .price-card, " +
    ".hero-card, .section-header, .two-column > *, .highlight-box, " +
    ".trust-item, .contact-form, .build-card, .process-step, .ai-feature-box, .faq-item"
  );

  revealEls.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = `opacity 0.5s ease ${(i % 4) * 0.08}s, transform 0.5s ease ${(i % 4) * 0.08}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealEls.forEach((el) => observer.observe(el));

  // ─── Hero elements animate on load ───────────────────────────
  const heroEls = document.querySelectorAll(
    ".hero .eyebrow, .hero h1, .hero .hero-lead, .hero .hero-cta-group, .hero .trust-bar"
  );

  heroEls.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;

    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 50);
  });

  // ─── Nav scroll effect ───────────────────────────────────────
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 10) {
        header.style.boxShadow = "0 1px 20px rgba(0,0,0,0.08)";
      } else {
        header.style.boxShadow = "none";
      }
    }, { passive: true });
  }

  // ─── Smooth number counters (optional — for stats section) ───
  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString("fi-FI");
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => counterObserver.observe(c));
  }

  // ─── Respect prefers-reduced-motion ─────────────────────────
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[style*='opacity']").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.transition = "none";
    });
  }

});
