import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
  ? new URL(process.env.NEXT_PUBLIC_APP_URL) 
  : new URL('https://alexia-camara-app.vercel.app'); // Fallback seguro para o build

export const metadata: Metadata = {
  title: "Alexia Câmara — Prontuário",
  description: "Prontuário eletrônico de fisioterapia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
