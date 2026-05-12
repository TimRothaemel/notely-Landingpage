import { loadLang, translate } from "./src/js/lang/apply-language.js";
import { changeLanguage } from "./src/js/lang/change-language.js";
import {
  createEarlyAccessLead,
  createSurveyResponse,
  loadLiveStats,
} from "./src/js/supabase/api.js";

function setActiveLanguage(lang) {
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
}

function formatPriceValue(value) {
  if (Number(value) <= 0) {
    return translate("survey.options.price.free", "Free");
  }

  return `EUR ${Number(value)}`;
}

function updatePriceOutput() {
  const slider = document.getElementById("price-expectation");
  const output = document.getElementById("price-output");

  if (!slider || !output) {
    return;
  }

  output.textContent = formatPriceValue(slider.value);
}

function togglePriceQuestion() {
  const selectedPremium = document.querySelector("input[name='premium_interest']:checked")?.value;
  const priceGroup = document.getElementById("price-group");
  const priceSlider = document.getElementById("price-expectation");
  const shouldShow = selectedPremium === "yes" || selectedPremium === "maybe";

  if (!priceGroup) {
    return;
  }

  priceGroup.hidden = !shouldShow;

  if (priceSlider) {
    priceSlider.disabled = !shouldShow;

    if (!shouldShow) {
      priceSlider.value = "0";
    } else if (Number(priceSlider.value) <= 0) {
      priceSlider.value = "5";
    }

    updatePriceOutput();
  }
}

function setupRevealAnimation() {
  const revealElements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((element) => observer.observe(element));
}

function formatNumber(value) {
  return new Intl.NumberFormat(document.documentElement.lang || "en").format(value);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setMessage(element, text = "", type = "") {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove("is-error", "is-success");

  if (type) {
    element.classList.add(type);
  }
}

function getReadableErrorMessage(error, fallbackKey, fallbackText) {
  return error?.userMessage || translate(fallbackKey, fallbackText);
}

function setButtonLoading(button, isLoading) {
  if (!button) {
    return;
  }

  const defaultLabelKey = button.dataset.submitLabel;
  const loadingLabelKey = button.dataset.loadingLabel;

  button.disabled = isLoading;
  button.textContent = isLoading
    ? translate(loadingLabelKey, "Loading...")
    : translate(defaultLabelKey, button.textContent);
}

function animateStat(element, nextValue) {
  const currentValue = Number(element.dataset.value || "0");
  const targetValue = Number(nextValue || 0);
  const start = performance.now();
  const duration = 900;

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.round(currentValue + (targetValue - currentValue) * eased);

    element.textContent = formatNumber(value);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.dataset.value = String(targetValue);
    }
  }

  requestAnimationFrame(tick);
}

async function refreshStats() {
  const stats = await loadLiveStats();

  document.querySelectorAll("[data-stat]").forEach((element) => {
    const nextValue = stats?.[element.dataset.stat];

    if (typeof nextValue === "number") {
      animateStat(element, nextValue);
    } else {
      element.textContent = "-";
      element.dataset.value = "0";
    }
  });
}

function getCountryCode() {
  const locale = navigator.language || "";
  const parts = locale.split("-");
  return parts[1]?.toUpperCase() || null;
}

function setDefaultSurveyValues(form) {
  const defaults = [
    ["source", "instagram"],
    ["wanted_feature", "ai_flashcards"],
    ["premium_interest", "yes"],
    ["device_type", "iphone"],
  ];

  defaults.forEach(([name, value]) => {
    const input = form.querySelector(`input[name="${name}"][value="${value}"]`);

    if (input) {
      input.checked = true;
    }
  });

  const priceSlider = form.querySelector("#price-expectation");

  if (priceSlider) {
    priceSlider.value = "5";
  }

  togglePriceQuestion();
}

function setupEarlyAccessForm(formId, messageId, source) {
  const form = document.getElementById(formId);
  const message = document.getElementById(messageId);

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    const emailInput = form.querySelector("input[name='email']");
    const email = emailInput?.value.trim() || "";

    if (!validateEmail(email)) {
      setMessage(message, translate("messages.invalidEmail", "Please enter a valid email."), "is-error");
      return;
    }

    setMessage(message, "");
    setButtonLoading(button, true);

    try {
      await createEarlyAccessLead(email, source);
      form.reset();
      setMessage(message, translate("messages.emailSuccess", "You are on the list."), "is-success");
      await refreshStats();
    } catch (error) {
      console.error("Early access submit failed", error, error?.debugInfo || null);
      setMessage(
        message,
        getReadableErrorMessage(error, "messages.formError", "Something went wrong. Please try again."),
        "is-error",
      );
    } finally {
      setButtonLoading(button, false);
    }
  });
}

function setupSurveyForm() {
  const form = document.getElementById("survey-form");
  const message = document.getElementById("survey-form-message");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    const formData = new FormData(form);

    const payload = {
      preferred_language: document.documentElement.lang,
      source: formData.get("source"),
      wanted_feature: formData.get("wanted_feature"),
      premium_interest: formData.get("premium_interest"),
      price_expectation: formData.get("premium_interest") === "no" ? null : formData.get("price_expectation"),
      device_type: formData.get("device_type"),
      feedback: String(formData.get("feedback") || "").trim() || null,
      locale: document.documentElement.lang,
      country_code: getCountryCode(),
    };

    setMessage(message, "");
    setButtonLoading(button, true);

    try {
      await createSurveyResponse(payload);
      form.reset();
      setDefaultSurveyValues(form);
      setMessage(message, translate("messages.surveySuccess", "Thanks for helping shape the app."), "is-success");
      await refreshStats();
    } catch (error) {
      console.error("Survey submit failed", error, error?.debugInfo || null);
      setMessage(
        message,
        getReadableErrorMessage(error, "messages.formError", "Something went wrong. Please try again."),
        "is-error",
      );
    } finally {
      setButtonLoading(button, false);
    }
  });

  form.querySelectorAll("input[name='premium_interest']").forEach((input) => {
    input.addEventListener("change", togglePriceQuestion);
  });

  form.querySelector("#price-expectation")?.addEventListener("input", updatePriceOutput);
}

window.changeLanguage = async (lang) => {
  await changeLanguage(lang);
  setActiveLanguage(lang);
  await refreshStats();
};

document.addEventListener("DOMContentLoaded", async () => {
  const currentLang = localStorage.getItem("lang") || "en";

  await loadLang(currentLang);
  console.info("Supabase config loaded", {
    hasConfig: Boolean(window.__SUPABASE_URL__ || import.meta.env?.VITE_SUPABASE_URL),
  });
  setActiveLanguage(currentLang);
  setupRevealAnimation();
  setupEarlyAccessForm("hero-early-access-form", "hero-form-message", "hero");
  setupEarlyAccessForm("cta-early-access-form", "cta-form-message", "cta");
  setupSurveyForm();
  setDefaultSurveyValues(document.getElementById("survey-form"));
  updatePriceOutput();
  await refreshStats();
});
