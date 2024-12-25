import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Trusted Simple & Fast Expense Tracker | Money Out",
  description:
    "Money Out is the ultimate expense tracker for solo entrepreneurs. Easily log and manage your expenses in seconds, gain financial clarity, and focus on growing your business with our user-friendly tool.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
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
