export const LOCALES = ["en", "ko", "ja", "zh-Hans", "zh-Hant", "th", "es", "pt", "id", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DATE_LOCALE: Record<Locale, string> = {
  en: "en-US",
  ko: "ko-KR",
  ja: "ja-JP",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
  th: "th-TH",
  es: "es-ES",
  pt: "pt-BR",
  id: "id-ID",
  fr: "fr-FR",
};

export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  ko: "ko",
  ja: "ja",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-Hant",
  th: "th",
  es: "es",
  pt: "pt",
  id: "id",
  fr: "fr",
};

function fromTag(tag: string): Locale | null {
  const code = tag.toLowerCase().trim();
  if (!code || code === "*") return null;
  if (code.startsWith("ko")) return "ko";
  if (code.startsWith("ja")) return "ja";
  if (code.startsWith("zh")) {
    if (code.includes("tw") || code.includes("hk") || code.includes("hant")) return "zh-Hant";
    return "zh-Hans";
  }
  if (code.startsWith("th")) return "th";
  if (code.startsWith("es")) return "es";
  if (code.startsWith("pt")) return "pt";
  if (code.startsWith("id") || code === "in") return "id";
  if (code.startsWith("fr")) return "fr";
  if (code.startsWith("en")) return "en";
  return null;
}

/** The browser/system language, from the Accept-Language header. */
export function matchLocale(header: string | null): Locale {
  if (!header) return "en";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().toLowerCase().startsWith("q="));
      const quality = qParam ? Number(qParam.split("=")[1]) : 1;
      return { tag, quality: Number.isFinite(quality) ? quality : 0 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const part of ranked) {
    const locale = fromTag(part.tag);
    if (locale) return locale;
  }
  return "en";
}
