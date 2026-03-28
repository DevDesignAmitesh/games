import type { Metadata } from "next";
import { Bebas_Neue, Nunito_Sans } from "next/font/google";
import "./globals.css";

const bebasFont = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

const nuniFont = Nunito_Sans({
  variable: "--font-nuni",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
});

export const metadata: Metadata = {
  title: "Matiks - Mental Math Duels & Puzzle Battles | Train Your Brain",
  description:
    "Challenge players worldwide in fast-paced math duels and puzzle battles on Matiks! Compete for global rankings, improve your speed & accuracy, and climb the leaderboard—just like chess, but with math!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebasFont.variable} ${nuniFont.variable} antialiased custom-scrollbar`}
      >
        {children}
      </body>
    </html>
  );
}
