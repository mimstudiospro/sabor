import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DICT, readStoredLang, storeLang } from "./i18n";
import type { DictKey, Lang } from "./i18n";

export type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
};

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => undefined,
  t: (key) => DICT[key].en,
});

/** Provides the current language to the whole app. The choice is
 * stored in localStorage, so it survives reloads. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    typeof window === "undefined" ? "en" : readStoredLang(),
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(next: Lang) {
    storeLang(next);
    setLangState(next);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: (key) => DICT[key][lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
