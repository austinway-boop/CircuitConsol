import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta"
});

export const metadata: Metadata = {
  title: "Circuit Console",
  description: "Beautiful API dashboard for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jakarta.className}>
        <ThemeProvider defaultTheme="light" storageKey="circuit-ui-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

