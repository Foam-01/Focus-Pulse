import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai, Prompt } from 'next/font/google';
import '../styles/globals.css';

// Self-hosted via next/font — eliminates render-blocking external stylesheet
// and reduces IBM Plex Sans Thai from 5 weights (300,400,500,600,700) → 4 weights
const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm',
  preload: true,
});

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-prompt',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Focus Pulse - ระบบติดตามเวลาและตั้งเป้าหมายโฟกัสงาน',
  description: 'แอปพลิเคชัน Focus Pulse สำหรับจับเวลาโฟกัส Pomodoro สรุปสถิติการทำงานประจำวัน คลังวิดีโอพักสายตา และเทียบเวลาโลก',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" data-theme="dark" className={`${ibmPlexSansThai.variable} ${prompt.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}

