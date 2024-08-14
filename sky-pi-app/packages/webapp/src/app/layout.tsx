import "~/styles/globals.css";

import { Instrument_Sans as FontSans } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils/ui";

export const metadata = {
  title: "Sky Pi",
  description: "Astrophotography weather conditions, at a glance.",
  // icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "flex min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <main className="flex w-full">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </main>
      </body>
    </html>
  );
}
