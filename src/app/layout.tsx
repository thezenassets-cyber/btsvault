import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, DM_Sans } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageLoader } from "@/components/layout/page-loader";
import { TawkWidget } from "@/components/support/tawk-widget";
import { VaultProvider } from "@/components/vault/vault-context";
import { CartProvider } from "@/components/cart/cart-context";
import { OrderProvider } from "@/components/cart/order-context";
import { ClientCardProvider } from "@/components/client-card/client-card-context";
import { LocaleProvider } from "@/lib/i18n/provider";
import { HTML_LANG, matchLocale } from "@/lib/i18n/locale";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://armyvault.site"),
  title: "ARMY Vault — BTS Merchandise Megastore",
  description:
    "Present your Client Card. Shop BTS merch and choose your seat for every remaining ARIRANG show. 32 million+ active users worldwide.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a1a",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const locale = matchLocale(headerList.get("accept-language"));
  return (
    <html lang={HTML_LANG[locale]} className={`${inter.variable} ${dmSans.variable}`}>
      <body className="min-h-screen">
        <PageLoader />
        <LocaleProvider locale={locale}>
        <VaultProvider>
          <CartProvider>
            <OrderProvider>
              <ClientCardProvider>
                <Header />
                <main className="min-w-0">{children}</main>
                <Footer />
                <TawkWidget />
              </ClientCardProvider>
            </OrderProvider>
          </CartProvider>
        </VaultProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
