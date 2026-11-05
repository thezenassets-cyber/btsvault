"use client";

import { createContext, useContext, useMemo } from "react";
import { catalogs, type MessageKey } from "@/lib/i18n/catalog";
import { DATE_LOCALE, type Locale } from "@/lib/i18n/locale";

interface LocaleValue {
  locale: Locale;
  dateLocale: string;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo<LocaleValue>(
    () => ({
      locale,
      dateLocale: DATE_LOCALE[locale],
      t: (key) => catalogs[locale][key] ?? catalogs.en[key],
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useI18n must be used within LocaleProvider");
  return value;
}
