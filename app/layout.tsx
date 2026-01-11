import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Topbar } from "@/src/components/ui/topbar";
import { Providers } from "./providers";
import { auth } from "@/src/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Garage ERP",
  description: "Gestion de garage automobile - Devis, Facturation, Atelier",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoginPage = false; // Will be handled by middleware

  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <Providers>
          {session && <Topbar />}
          <main className={session ? "container mx-auto px-4 py-6" : ""}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
