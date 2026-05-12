import { loadLang } from "./lang/apply-language.js";
import { changeLanguage } from "./lang/change-language.js";

function setActiveLanguage(lang) {
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
}

window.changeLanguage = async (lang) => {
  await changeLanguage(lang);
  setActiveLanguage(lang);
};

document.addEventListener("DOMContentLoaded", async () => {
  const currentLang = localStorage.getItem("lang") || "en";

  await loadLang(currentLang);
  setActiveLanguage(currentLang);
});
