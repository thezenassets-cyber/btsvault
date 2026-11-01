import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageLoader } from "@/components/layout/page-loader";
import { VaultProvider } from "@/components/vault/vault-context";
import { CartProvider } from "@/components/cart/cart-context";
import { OrderProvider } from "@/components/cart/order-context";
import { ClientCardProvider } from "@/components/client-card/client-card-context";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <body className="min-h-screen">
        <PageLoader />
        <VaultProvider>
          <CartProvider>
            <OrderProvider>
              <ClientCardProvider>
                <Header />
                <main>{children}</main>
                <Footer />
              </ClientCardProvider>
            </OrderProvider>
          </CartProvider>
        </VaultProvider>
      </body>
    </html>
  );
}
