export type Locale = "en" | "fr" | "es";

export const translations = {
  en: {
    welcome: "Diaspora Mortgages on Stellar",
    calculator: "Mortgage Calculator",
    invest: "Invest in Diaspora Homes",
    trustee: "Trustee Portal",
  },
  fr: {
    welcome: "Hypothèques de la Diaspora sur Stellar",
    calculator: "Calculateur Hypothécaire",
    invest: "Investir dans l'Immobilier",
    trustee: "Portail des Fiduciaires",
  },
  es: {
    welcome: "Hipotecas de la Diáspora en Stellar",
    calculator: "Calculadora de Hipotecas",
    invest: "Invertir en Viviendas",
    trustee: "Portal de Fiduciarios",
  },
};

export function t(key: keyof typeof translations.en, locale: Locale = "en"): string {
  return translations[locale]?.[key] || translations.en[key];
}
