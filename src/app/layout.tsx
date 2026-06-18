import type { Metadata, Viewport } from "next";
import { EazoProvider } from "@eazo/sdk/react";
import { I18nProvider } from "@/lib/i18n/provider";
import { UserSyncEffect } from "@/components/user-profile/user-sync-effect";
import "./globals.css";

const title = process.env.NEXT_PUBLIC_APP_TITLE || "听瓜";
const description = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "敲一下，听听西瓜甜度";

export const metadata: Metadata = {
  title,
  description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#b2ebf2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.ReactNativeWebView = window.ReactNativeWebView || { postMessage: function() {} };
              `,
            }}
          />
        )}
      </head>
      <body className="antialiased">
        <I18nProvider>
          <EazoProvider>
            <UserSyncEffect />
            {children}
          </EazoProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
