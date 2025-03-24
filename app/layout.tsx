import React from 'react';
import { AuthProvider } from '@/lib/auth';
import './globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Calculadora de Custos',
  description: 'Aplicação para cálculo de custos de visitas técnicas e implementações',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-950 text-white font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script id="next-bootstrap-fix" strategy="beforeInteractive">
          {`
            // Fix for missing bootstrap script
            if (window.__NEXT_DATA__ && !window.__NEXT_DATA__.tree) {
              window.__NEXT_DATA__.tree = {};
            }
          `}
        </Script>
      </body>
    </html>
  );
}
