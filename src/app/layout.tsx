import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "GreenRide Express - Electric Bus Service",
  description: "Jharkhand's first electric intercity bus service. Travel sustainably from Jhumri Telaiya to Ranchi.",
  keywords: "electric bus, green transport, Jharkhand, bus booking, eco-friendly travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              padding: '16px',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc2626',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
