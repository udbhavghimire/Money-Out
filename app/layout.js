import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import { ClerkProvider } from "@clerk/nextjs";
import { TokenProvider } from "@/components/providers/token-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Money Out - Expense Management Made Simple",
  description:
    "Effortless Expense Tracking, Budgeting & Financial Insights for Individuals and Businesses",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <TokenProvider>
            <div className="relative z-10">
              <NextTopLoader color="red" height={3} />
              {children}
              <Toaster position="top-center" />
            </div>
          </TokenProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
