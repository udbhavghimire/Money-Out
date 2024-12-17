import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SixDesign - Real Estate Marketing & Branding",
  description:
    "Project Marketing, CRM Integration & Branding for Realtors, Brokerages & Builders",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader color="red" height={3} />
        {children}
        <Toaster position="top-center" />
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="yipDJkrnk1SlXl4AgedAyg"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
