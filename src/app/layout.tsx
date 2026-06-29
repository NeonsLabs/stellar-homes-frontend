import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StellarHomes | Decentralized Real Estate Tokenization & Mortgages",
  description: "Secure, compliant, and automated property financing and development for diaspora communities built on Stellar. Bridge your capital to home ownership.",
  keywords: ["Stellar", "Soroban", "Real Estate", "Tokenization", "Mortgages", "Diaspora", "Nigeria", "Ghana", "USDC", "Smart Contracts"],
  authors: [{ name: "StellarHomes Team" }],
  openGraph: {
    title: "StellarHomes | Decentralized Real Estate Tokenization & Mortgages",
    description: "Bridge your capital to home ownership. Secure, compliant, and automated property financing for diaspora communities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0b0f19] text-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}
