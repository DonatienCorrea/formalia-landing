// Formalia landing — honest, local-only interactions.
// The waitlist forms validate in the UI and do not send data anywhere until a
// real signup endpoint is connected.

(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const dossier = document.querySelector(".dossier-console");
  if (dossier) {
    const boxRows = dossier.querySelectorAll(".cerfa-boxes");
    const steps = [...dossier.querySelectorAll(".dossier-step")];
    const badge = dossier.querySelector("#console-badge");
    const status = dossier.querySelector("#console-status");

    const buildLetters = (row) => {
      const word = row.dataset.word || "";
      row.innerHTML = "";
      [...word].forEach((character) => {
        const span = document.createElement("span");
        span.className = "cerfa-letter";
        span.textContent = character;
        row.appendChild(span);
      });
    };

    const markStep = (currentIndex) => {
      steps.forEach((step, index) => {
        step.classList.toggle("is-current", index === currentIndex);
        step.classList.toggle("is-complete", index < currentIndex);
      });
    };

    boxRows.forEach(buildLetters);

    const playSequence = () => {
      let delay = 0;

      boxRows.forEach((row) => row.classList.remove("is-filling"));
      if (badge) badge.classList.remove("is-ready");
      if (badge) badge.textContent = "Simulation illustrative";
      if (status) status.textContent = "Préremplissage en cours";
      markStep(0);

      boxRows.forEach((row, index) => {
        const letters = row.querySelectorAll(".cerfa-letter");
        letters.forEach((letter, letterIndex) => {
          letter.style.animationDelay = `${delay + letterIndex * 55}ms`;
        });
        // Force restart.
        row.offsetWidth;
        row.classList.add("is-filling");

        const nextStepIndex = Math.min(index + 1, steps.length - 1);
        window.setTimeout(() => markStep(nextStepIndex), delay + Math.max(letters.length * 55 - 80, 0));
        delay += letters.length * 55 + 140;
      });

      window.setTimeout(() => {
        steps.forEach((step) => {
          step.classList.remove("is-current");
          step.classList.add("is-complete");
        });
        if (badge) {
          badge.classList.add("is-ready");
          badge.textContent = "Dossier prêt à relire";
        }
        if (status) status.textContent = "Préremplissage terminé";
      }, delay + 220);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      boxRows.forEach((row) => {
        row.querySelectorAll(".cerfa-letter").forEach((letter) => {
          letter.style.opacity = "1";
          letter.style.transform = "none";
        });
      });
      steps.forEach((step) => step.classList.add("is-complete"));
      steps.forEach((step) => step.classList.remove("is-current"));
      if (badge) {
        badge.classList.add("is-ready");
        badge.textContent = "Dossier prêt à relire";
      }
      if (status) status.textContent = "Préremplissage terminé";
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
        { threshold: 0.45 }
      );
      observer.observe(dossier);
    } else {
      playSequence();
    }
  }

  const wireForm = (formId, noteSelector) => {
    const form = document.getElementById(formId);
    if (!form) return;

    const note = form.parentElement.querySelector(noteSelector) || form.nextElementSibling;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const value = (input?.value || "").trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!valid) {
        if (note) {
          note.textContent = "Merci d'indiquer une adresse e-mail valide.";
          note.dataset.state = "error";
        }
        input?.focus();
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

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.target));
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const nextIndex = event.key === "ArrowRight"
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        activate(tabs[nextIndex].dataset.target);
      });
    });
  }
})();
