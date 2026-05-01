import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocuVerdict",
  description: "AI Document Extraction QA Workbench",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
