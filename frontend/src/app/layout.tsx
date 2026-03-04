import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'FashionHub',
  description: 'Your premium fashion destination',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant:wght@400;500;600&family=Raleway:wght@300;400;500;600&family=Montserrat:wght@300;400;500;600&family=Lora:wght@400;500;600&family=Inter:wght@300;400;500;600&family=Poppins:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&family=Nunito:wght@300;400;500;600&family=Open+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
