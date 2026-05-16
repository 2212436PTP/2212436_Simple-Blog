import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/header-wrapper";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "GenZ.Space",
  description: "Góc chia sẻ kiến thức, kinh nghiệm và câu chuyện của thế hệ GenZ",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="vi" suppressHydrationWarning>
 <body className={`${inter.className} bg-slate-50 text-slate-900`}>
 <div className="flex flex-col min-h-screen">
 <HeaderWrapper />
 <main className="flex-1">{children}</main>
 </div>
 </body>
 </html>
 );
}
