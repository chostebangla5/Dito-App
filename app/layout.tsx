import type { Metadata } from "next";
import { Nunito, Lato, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";

const nunito = Nunito({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito"
});
const lato = Lato({ 
  subsets: ["latin"], 
  weight: ["300", "400", "700"],
  variable: "--font-lato" 
});
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins" 
});

export const metadata: Metadata = {
  title: "Dito — They're always with you",
  description: "Talk to the people you love — romantic partners, parents, friends, or those you've lost — as a living AI that knows them like you do.",
  keywords: ["AI companion", "chat", "emotional support", "partner", "loved ones"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${nunito.variable} ${lato.variable} ${poppins.variable}`}>
      <body className="min-h-full flex flex-col antialiased transition-colors duration-300 font-lato" suppressHydrationWarning>
        <div className="bg-gradient-glass" />
        <ThemeProvider>
          <Providers>
            {children}
            <ThemeToggle />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
