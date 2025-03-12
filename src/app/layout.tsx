import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/tiptap.css";
import AuthProvider from "@/components/auth/auth-provider";
import { CartProvider } from "@/hooks/useCart";
import { Toaster } from "react-hot-toast";
import MainNavbar from "@/components/MainNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plataforma de Cursos",
  description: "Aprenda novas habilidades com nossos cursos online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <MainNavbar />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
