// Formalia landing — small, honest interactions.
// No real backend exists yet: the waitlist forms confirm locally in the UI
// and do not silently pretend an email was sent anywhere. Wire a real
// endpoint (Formspree, Buttondown, your own API) before launch — see README.

(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Cerfa autofill + stamp animation, replayed on scroll into view ---
  const cerfaCard = document.querySelector(".cerfa-card");
  if (cerfaCard) {
    const boxRows = cerfaCard.querySelectorAll(".cerfa-boxes");
    const stamp = cerfaCard.querySelector(".stamp");

    const buildLetters = (row) => {
      const word = row.dataset.word || "";
      row.innerHTML = "";
      [...word].forEach((ch) => {
        const span = document.createElement("span");
        span.className = "cerfa-letter";
        span.textContent = ch;
        row.appendChild(span);
      });
    };
    boxRows.forEach(buildLetters);

    const playSequence = () => {
      boxRows.forEach((row) => row.classList.remove("is-filling"));
      if (stamp) stamp.classList.remove("is-stamped");

      let delay = 0;
      boxRows.forEach((row) => {
        const letters = row.querySelectorAll(".cerfa-letter");
        letters.forEach((el, i) => {
          el.style.animationDelay = `${delay + i * 55}ms`;
        });
        // eslint-disable-next-line no-unused-expressions
        row.offsetWidth; // restart CSS animation
        row.classList.add("is-filling");
        delay += letters.length * 55 + 120;
      });

      if (stamp) {
        window.setTimeout(() => stamp.classList.add("is-stamped"), delay + 200);
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      boxRows.forEach((row) => {
        row.querySelectorAll(".cerfa-letter").forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      });
      if (stamp) { stamp.style.opacity = "0.92"; stamp.style.transform = "rotate(-9deg) scale(1)"; }
    } else if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              playSequence();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      observer.observe(cerfaCard);
    } else {
      playSequence();
    }
  }

  // --- Waitlist forms: honest local confirmation, no fake backend ---
  const wireForm = (formId, noteSelector) => {
    const form = document.getElementById(formId);
    if (!form) return;
    const note = form.parentElement.querySelector(noteSelector) || form.nextElementSibling;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const value = (input.value || "").trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!valid) {
        if (note) {
          note.textContent = "Merci d'indiquer une adresse e-mail valide.";
          note.dataset.state = "error";
        }
        input.focus();
        return;
      }

      if (note) {
        note.textContent = "Merci ! Votre adresse est enregistrée localement dans ce prototype — branchez un vrai service d'inscription avant la mise en ligne définitive.";
        note.dataset.state = "success";
      }
      form.reset();
    });
  };

  wireForm("waitlist-form", ".hero-form-note");
  wireForm("waitlist-form-2", ".cta-form-note");

  // --- Demo tabs: accessible tablist switching between simulated scenarios ---
  const demoWidget = document.querySelector("[data-demo]");
  if (demoWidget) {
    const tabs = [...demoWidget.querySelectorAll(".demo-tab")];
    const panels = [...demoWidget.querySelectorAll(".demo-panel")];

    const activate = (target) => {
      tabs.forEach((tab) => {
        const isTarget = tab.dataset.target === target;
        tab.classList.toggle("is-active", isTarget);
        tab.setAttribute("aria-selected", String(isTarget));
        tab.tabIndex = isTarget ? 0 : -1;
      });
      panels.forEach((panel) => {
        const isTarget = panel.dataset.panel === target;
        panel.classList.toggle("is-active", isTarget);
        panel.hidden = !isTarget;
      });
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(tab.dataset.target));
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const next = event.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
        activate(tabs[next].dataset.target);
      });
    });
  }
})();
