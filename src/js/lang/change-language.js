import { loadLang } from "./apply-language.js";
export function changeLanguage(lang) {
  loadLang(lang);
  document.dispatchEvent( // Notify other components about the language change
    new CustomEvent("changeLanguage", {
      detail: { lang: lang },
    }),
  );
}
