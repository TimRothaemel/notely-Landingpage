import { loadLang } from "./apply-language.js";
export async function changeLanguage(lang) {
  await loadLang(lang);
  document.dispatchEvent( // Notify other components about the language change
    new CustomEvent("changeLanguage", {
      detail: { lang: lang },
    }),
  );
}
