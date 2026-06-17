import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enUS from "./locales/en-US.json";
import zhCN from "./locales/zh-CN.json";

export const supportedLocales = ["en-US", "zh-CN"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

const resources = {
  "en-US": { translation: enUS },
  "zh-CN": { translation: zhCN },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh-CN",
  fallbackLng: "zh-CN",
  interpolation: { escapeValue: false },
});

export function changeLocale(locale: SupportedLocale) {
  void i18n.changeLanguage(locale);
  if (typeof window !== "undefined") {
    localStorage.setItem("eazo-app.locale.v1", locale);
  }
}

export function getResolvedLocale(): SupportedLocale {
  if (typeof window === "undefined") return "zh-CN";
  const stored = localStorage.getItem("eazo-app.locale.v1") as SupportedLocale | null;
  if (stored && supportedLocales.includes(stored)) return stored;
  return "zh-CN";
}

export default i18n;
