import { loadLang } from "./src/js/lang/apply-language.js";
import { changeLanguage } from "./src/js/lang/change-language.js";

window.changeLanguage = changeLanguage; // Expose to global scope (header onclick)

document.addEventListener("DOMContentLoaded", async () => {
  // Load saved language or default to english
  let currentLang = localStorage.getItem("lang") || "en";
  loadLang(currentLang);

});