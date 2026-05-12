function getNestedValue(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

let currentTranslations = {};

export async function loadLang(lang) {
  const res = await fetch(`/lang/${lang}.json`);
  const data = await res.json();
  currentTranslations = data;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const translation = getNestedValue(data, key);

    if (translation !== undefined) {
      el.textContent = translation;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    const translation = getNestedValue(data, key);

    if (translation !== undefined) {
      el.setAttribute("placeholder", translation);
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.dataset.i18nAriaLabel;
    const translation = getNestedValue(data, key);

    if (translation !== undefined) {
      el.setAttribute("aria-label", translation);
    }
  });

  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);
}

export function translate(path, fallback = "") {
  return getNestedValue(currentTranslations, path) ?? fallback;
}
