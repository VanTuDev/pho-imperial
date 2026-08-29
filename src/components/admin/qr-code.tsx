"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

export function tableOrderUrl(code: string): string {
  const base = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/order?table=${encodeURIComponent(code)}`;
}

export function useQrDataUrl(text: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(text, {
      width: 640,
      margin: 1,
      color: { dark: "#131313", light: "#ffffff" },
    })
      .then((d) => active && setUrl(d))
      .catch(() => active && setUrl(null));
    return () => {
      active = false;
    };
  }, [text]);
  return url;
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Open a print-ready page for one table's QR code. */
export function printTableQr(
  label: string,
  code: string,
  text: { heading: string; caption: string } = {
    heading: `Table ${label}`,
    caption: "Scan to open the menu and order",
  },
) {
  const url = tableOrderUrl(code);
  QRCode.toDataURL(url, { width: 900, margin: 2 }).then((dataUrl) => {
    const w = window.open("", "_blank", "width=520,height=680");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(text.heading)}</title>
      <style>
        body{font-family:system-ui,sans-serif;text-align:center;margin:0;padding:40px}
        h1{font-size:28px;margin:0 0 4px}
        p{color:#555;margin:0 0 24px;font-size:14px}
        img{width:340px;height:340px}
        .code{margin-top:16px;font-size:13px;color:#888;letter-spacing:.05em;word-break:break-all}
        @media print{@page{margin:12mm}}
      </style></head>
      <body onload="setTimeout(function(){window.print()},250)">
        <h1>${esc(text.heading)}</h1>
        <p>${esc(text.caption)}</p>
        <img src="${dataUrl}" alt="QR">
        <div class="code">${esc(url)}</div>
      </body></html>`);
    w.document.close();
  });
}

export function QrThumb({ code, size = 96 }: { code: string; size?: number }) {
  const dataUrl = useQrDataUrl(tableOrderUrl(code));
  return (
    <div
      className="shrink-0 overflow-hidden rounded-lg border border-outline-variant/40 bg-white"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {dataUrl && <img src={dataUrl} alt={`QR стол ${code}`} width={size} height={size} />}
    </div>
  );
}
