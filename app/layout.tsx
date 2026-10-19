import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/site";
import { siteOrigin } from "@/lib/server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteOrigin()),
    title: {
      default: "Quazar Labs — Ideas into working projects",
      template: "%s | Quazar Labs",
    },
    description:
      "Free practical software-building lessons for Grades 7–10. Learn developer tools, build thoughtfully with AI, and prepare for your first hackathon.",
    openGraph: {
      title: "Quazar Labs — Ideas into working projects",
      description:
        "A little curiosity. A lot of possibility. Free project-based learning for Grades 7–10.",
      images: [{ url: "/social.png", width: 1200, height: 630 }],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
