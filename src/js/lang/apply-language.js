function getNestedValue(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

export async function loadLang(lang) {
  const res = await fetch(`/lang/${lang}.json`);
  const data = await res.json();

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const translation = getNestedValue(data, key);

    if (translation !== undefined) {
      el.textContent = translation;
    }
  });

  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);
}
