export const metadata = {
  title: "Track&Trace4Tools ROI Calculator – The Grey Elephant",
  description: "Estimate savings from fewer plate remakes, reduced downtime, and lower waste.",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
