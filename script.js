// Formalia landing — honest, local-only interactions.
// The simulator and waitlist forms never send data anywhere.

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const scenarios = {
    passeport: {
      name: "Pré-demande de passeport",
      detail: "Le scénario organise une demande fictive avant relecture.",
      questions: [
        {
          label: "Dans ce scénario, de quel type de demande s’agit-il ?",
          field: "Type de demande",
          options: [
            ["Renouvellement", "Renouvellement"],
            ["Première demande", "Première demande"]
          ]
        },
        {
          label: "Pour qui préparez-vous ce scénario ?",
          field: "Personne concernée",
          options: [
            ["Adulte", "Personne majeure"],
            ["Mineur", "Personne mineure"]
          ]
        },
        {
          label: "Quelle situation de domicile faut-il illustrer ?",
          field: "Situation de domicile",
          options: [
            ["Domicile personnel", "Justificatif à son nom"],
            ["Hébergement", "Hébergement chez un tiers"]
          ]
        }
      ],
      documents: ["Photo d’identité conforme", "Justificatif de domicile adapté", "Pièce d’identité actuelle"]
    },
    caf: {
      name: "Demande d’aide au logement",
      detail: "Le scénario rassemble les éléments fictifs d’un dossier logement.",
      questions: [
        {
          label: "Quelle situation voulez-vous illustrer ?",
          field: "Situation",
          options: [
            ["Nouvel emménagement", "Entrée dans un logement"],
            ["Changement de logement", "Déménagement"]
          ]
        },
        {
          label: "Comment le logement fictif est-il occupé ?",
          field: "Occupation",
          options: [
            ["Seul·e", "Location individuelle"],
            ["En colocation", "Colocation"]
          ]
        },
        {
          label: "Les ressources fictives ont-elles changé ?",
          field: "Ressources",
          options: [
            ["Situation stable", "Sans changement déclaré"],
            ["Situation modifiée", "Changement à signaler"]
          ]
        }
      ],
      documents: ["Éléments du bail", "Montant du loyer", "Justificatifs de ressources"]
    },
    sejour: {
      name: "Dossier de titre de séjour",
      detail: "Le scénario prépare un aperçu fictif à vérifier selon la situation réelle.",
      questions: [
        {
          label: "Quel type de démarche voulez-vous simuler ?",
          field: "Type de demande",
          options: [
            ["Renouvellement", "Renouvellement"],
            ["Première demande", "Première demande"]
          ]
        },
        {
          label: "Quel motif fictif faut-il organiser ?",
          field: "Motif",
          options: [
            ["Études", "Études"],
            ["Travail", "Activité professionnelle"],
            ["Vie familiale", "Vie privée et familiale"]
          ]
        },
        {
          label: "Où en sont les pièces de ce scénario ?",
          field: "État des pièces",
          options: [
            ["Déjà rassemblées", "Pièces disponibles"],
            ["À rassembler", "Pièces à organiser"]
          ]
        }
      ],
      documents: ["Pièce d’identité actuelle", "Justificatif lié au motif", "Justificatif de domicile adapté"]
    }
  };

  const simulator = document.querySelector("[data-simulator]");
  if (simulator) {
    const form = simulator.querySelector("[data-simulator-form]");
    const procedureStep = simulator.querySelector("[data-procedure-step]");
    const questionStep = simulator.querySelector("[data-question-step]");
    const questionTitle = simulator.querySelector("[data-question-title]");
    const questionOptions = simulator.querySelector("[data-question-options]");
    const output = simulator.querySelector("[data-output]");
    const formName = simulator.querySelector("[data-form-name]");
    const formDetail = simulator.querySelector("[data-form-detail]");
    const previewStatus = simulator.querySelector("[data-preview-status]");
    const previewFields = simulator.querySelector("[data-preview-fields]");
    const documents = simulator.querySelector("[data-documents]");
    const resetButton = simulator.querySelector("[data-reset]");
    const backButton = simulator.querySelector("[data-back]");
    const liveRegion = simulator.querySelector("[data-simulator-live]");
    const processSteps = [...simulator.querySelectorAll(".process-rail li")];
    let procedure = null;
    let questionIndex = 0;
    let answers = [];
    let completionTimer = null;

    const setStage = (stage) => {
      processSteps.forEach((step, index) => {
        step.classList.toggle("is-current", index === stage);
        step.classList.toggle("is-complete", index < stage);
        if (index === stage) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
    };

    const renderOutput = (stage) => {
      if (!procedure) return;
      const scenario = scenarios[procedure];
      formName.textContent = scenario.name;
      formDetail.textContent = stage === 4
        ? "Le dossier fictif est complet et prêt à relire."
        : scenario.detail;
      previewStatus.textContent = stage === 4 ? "Prêt à relire" : "Préremplissage";
      previewStatus.classList.toggle("is-ready", stage === 4);
      previewFields.innerHTML = "";

      scenario.questions.forEach((question, index) => {
        const row = document.createElement("div");
        const term = document.createElement("dt");
        const value = document.createElement("dd");
        term.textContent = question.field;
        value.textContent = answers[index] || "En attente";
        value.classList.toggle("is-pending", !answers[index]);
        row.append(term, value);
        previewFields.append(row);
      });

      const identifiedCount = stage === 4 ? scenario.documents.length : Math.max(0, stage - 1);
      documents.innerHTML = "";
      scenario.documents.forEach((documentName, index) => {
        const item = document.createElement("li");
        const label = document.createElement("span");
        const status = document.createElement("span");
        const identified = index < identifiedCount;
        label.textContent = documentName;
        status.textContent = identified ? "Identifiée" : "À fournir";
        item.classList.toggle("is-identified", identified);
        item.append(label, status);
        documents.append(item);
      });
    };

    const renderQuestion = () => {
      const question = scenarios[procedure].questions[questionIndex];
      questionTitle.textContent = question.label;
      questionOptions.innerHTML = "";

      question.options.forEach(([value, label], optionIndex) => {
        const optionLabel = document.createElement("label");
        const input = document.createElement("input");
        const text = document.createElement("span");
        input.type = "radio";
        input.name = `question-${questionIndex}`;
        input.value = value;
        input.required = true;
        input.checked = answers[questionIndex] === value;
        text.textContent = label;
        optionLabel.append(input, text);
        questionOptions.append(optionLabel);
        if (optionIndex === 0 && !answers[questionIndex]) input.checked = false;
      });

      procedureStep.hidden = true;
      questionStep.hidden = false;
      form.hidden = false;
      output.hidden = false;
      resetButton.hidden = false;
      setStage(Math.min(questionIndex + 1, 3));
      renderOutput(Math.min(questionIndex + 1, 3));
      questionOptions.querySelector("input")?.focus();
    };

    const completeSimulation = () => {
      questionStep.hidden = true;
      form.hidden = true;
      setStage(4);
      renderOutput(4);
      liveRegion.textContent = "Simulation terminée. Le dossier fictif est prêt à relire.";
      resetButton.focus();
    };

    const resetSimulation = () => {
      window.clearTimeout(completionTimer);
      completionTimer = null;
      procedure = null;
      questionIndex = 0;
      answers = [];
      form.reset();
      form.hidden = false;
      procedureStep.hidden = false;
      questionStep.hidden = true;
      output.hidden = true;
      resetButton.hidden = true;
      liveRegion.textContent = "";
      setStage(0);
      previewStatus.textContent = "À compléter";
      previewStatus.classList.remove("is-ready");
      questionTitle.textContent = "";
      questionOptions.replaceChildren();
      previewFields.replaceChildren();
      documents.replaceChildren();
      procedureStep.querySelector("input")?.focus();
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!procedure) {
        const selectedProcedure = form.querySelector('input[name="procedure"]:checked');
        if (!selectedProcedure) {
          form.reportValidity();
          return;
        }
        procedure = selectedProcedure.value;
        questionIndex = 0;
        answers = [];
        renderQuestion();
        return;
      }

      const selectedAnswer = questionStep.querySelector("input:checked");
      if (!selectedAnswer) {
        form.reportValidity();
        return;
      }

      answers[questionIndex] = selectedAnswer.value;
      const isLastQuestion = questionIndex === scenarios[procedure].questions.length - 1;
      if (isLastQuestion) {
        setStage(3);
        renderOutput(3);
        if (reducedMotion.matches) completeSimulation();
        else completionTimer = window.setTimeout(completeSimulation, 240);
        return;
      }

      questionIndex += 1;
      renderQuestion();
    });

    backButton.addEventListener("click", () => {
      window.clearTimeout(completionTimer);
      completionTimer = null;
      if (questionIndex === 0) {
        procedure = null;
        answers = [];
        form.reset();
        questionStep.hidden = true;
        output.hidden = true;
        procedureStep.hidden = false;
        resetButton.hidden = true;
        setStage(0);
        procedureStep.querySelector('input[name="procedure"]')?.focus();
        return;
      }
      answers.splice(questionIndex);
      questionIndex -= 1;
      renderQuestion();
    });

    resetButton.addEventListener("click", (event) => {
      event.preventDefault();
      resetSimulation();
    });
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
        note.textContent = "Merci ! Cette confirmation est locale : aucune adresse n'est envoyée ni enregistrée tant qu'un service d'inscription n'est pas connecté.";
        note.dataset.state = "success";
      }
      form.reset();
    });
  };

  wireForm("waitlist-form", ".hero-form-note");
  wireForm("waitlist-form-2", ".cta-form-note");

  const profiles = document.querySelector("[data-profiles]");
  if (profiles) {
    const tabs = [...profiles.querySelectorAll(".demo-tab")];
    const panels = [...profiles.querySelectorAll(".profile-panel")];

    const activate = (target, focus = false) => {
      tabs.forEach((tab) => {
        const isTarget = tab.dataset.target === target;
        tab.classList.toggle("is-active", isTarget);
        tab.setAttribute("aria-selected", String(isTarget));
        tab.tabIndex = isTarget ? 0 : -1;
        if (isTarget && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const isTarget = panel.dataset.panel === target;
        panel.hidden = !isTarget;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.target));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        activate(tabs[nextIndex].dataset.target, true);
      });
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const progressBar = document.querySelector(".reading-progress span");
  let scrollFrame = null;
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    scrollFrame = null;
  };
  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
  if ("IntersectionObserver" in window && navLinks.length) {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    const visibleSections = new Map();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.intersectionRatio);
        else visibleSections.delete(entry.target.id);
      });
      const active = [...visibleSections.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${active}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.2, 0.5, 0.8] });
    sections.forEach((section) => sectionObserver.observe(section));
  }
})();
