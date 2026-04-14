import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpendShare",
  description: "Track expenses. Split bills. Settle instantly.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpendShare",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/SpendShare.png',
    shortcut: '/SpendShare.png',
    apple: '/SpendShare.png',
    other: [
      { rel: 'icon', url: '/SpendShare.png' },
      { rel: 'apple-touch-icon', url: '/SpendShare.png' },
      { rel: 'apple-touch-icon-precomposed', url: '/SpendShare.png' },
      { rel: 'manifest', url: '/manifest.json' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Apple PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SpendShare" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="apple-touch-startup-image" href="/SpendShare.png" />
      </head>
      <body className={`${geist.className} bg-gray-50 min-h-screen antialiased`}>
        <ServiceWorkerRegistration />
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  );
}
