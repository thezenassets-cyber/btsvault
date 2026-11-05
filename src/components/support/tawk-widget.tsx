import Script from "next/script";

const TAWK_SRC = "https://embed.tawk.to/6ae762fc87dc0d3c355ec086/default";

export function TawkWidget() {
  return (
    <Script id="tawk-to" strategy="afterInteractive">
      {`
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        Tawk_API.customStyle = {
          zIndex: 55,
          visibility: {
            desktop: { position: "br", xOffset: 20, yOffset: 20 },
            mobile: { position: "br", xOffset: 12, yOffset: 72 }
          }
        };
        (function () {
          if (window.__armyVaultTawk || document.querySelector('script[src*="embed.tawk.to"]')) return;
          window.__armyVaultTawk = true;
          var s1 = document.createElement("script");
          var s0 = document.getElementsByTagName("script")[0];
          s1.async = true;
          s1.src = "${TAWK_SRC}";
          s1.charset = "UTF-8";
          s1.setAttribute("crossorigin", "*");
          if (s0 && s0.parentNode) s0.parentNode.insertBefore(s1, s0);
          else document.head.appendChild(s1);
        })();
      `}
    </Script>
  );
}
