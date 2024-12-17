import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Money Out - Expense Management Made Simple",
  description:
    "Effortless Expense Tracking, Budgeting & Financial Insights for Individuals and Businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-white">
        <div className="relative z-10">
          <NextTopLoader color="red" height={3} />
          {children}
          <Toaster position="top-center" />
          <Script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key="yipDJkrnk1SlXl4AgedAyg"
            strategy="afterInteractive"
          />
        </div>
      </body>
    </html>
  );
}
