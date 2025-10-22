import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-client-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "冒險島玩家資料中心｜MapleStory 角色查詢儀表板",
    template: "%s｜冒險島玩家資料中心",
  },
  description:
    "冒險島玩家資料中心串接 Nexon Open API，提供台服角色搜尋、能力值、裝備、技能與聯盟等完整資料面板，協助玩家快速掌握角色狀態。",
  applicationName: "冒險島玩家資料中心",
  keywords: [
    "冒險島",
    "MapleStory",
    "冒險島台服",
    "角色查詢",
    "Nexon Open API",
    "遊戲數據",
    "冒險島儀表板",
  ],
  authors: [{ name: "Love MapleStory" }],
  creator: "Love MapleStory",
  category: "gaming",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "冒險島玩家資料中心",
    title: "冒險島玩家資料中心｜MapleStory 角色查詢儀表板",
    description:
      "透過 Nexon Open API 快速查詢冒險島角色能力值、裝備、技能與聯盟資訊，打造專屬儀表板體驗。",
    url: "/",
    images: [
      {
        url: "/og-maplestory.svg",
        width: 1200,
        height: 630,
        alt: "冒險島玩家資料中心儀表板與角色資料預覽圖",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "冒險島玩家資料中心｜MapleStory 角色查詢儀表板",
    description:
      "以 Nexon Open API 打造的冒險島台服資料查詢平台，整合角色能力值、裝備、技能與聯盟資訊。",
    images: ["/og-maplestory.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
