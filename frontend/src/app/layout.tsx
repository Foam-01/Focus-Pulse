import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'เซสชันโฟกัส - แดชบอร์ดสรุปเวลา & ตัวจับเวลา 25 นาที',
  description: 'แอปพลิเคชันจับเวลาโฟกัสการทำงาน 25 นาที พร้อมแดชบอร์ดสรุปเวลาโฟกัส กราฟวิเคราะห์ และคลังวิดีโอผ่อนคลาย',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Prompt:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
