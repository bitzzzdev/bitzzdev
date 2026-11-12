import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const paperMono = localFont({
  src: [
    {
      path: "../public/fonts/PaperMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/PaperMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/PaperMono-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/PaperMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-paper",
  display: "swap",
});

// Canonical site domain
const CANONICAL_URL = "https://bitz.is-a.dev";

// Structured Data (JSON-LD) graph conforming to Schema.org standards
const personJsonLd = {
  "@type": "Person",
  "@id": `${CANONICAL_URL}/#person`,
  "name": "Dev Borah",
  "givenName": "Dev",
  "familyName": "Borah",
  "additionalName": "Bitupan",
  "alternateName": [
    "Bitupan Borah",
    "Bitz",
    "bitz.dev",
    "bitzzdev"
  ],
  "birthDate": "2008-08-25",
  "gender": "Male",
  "nationality": {
    "@type": "Country",
    "name": "India"
  },
  "homeLocation": {
    "@type": "Place",
    "name": "Assam, India"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Lakhimpur",
    "addressRegion": "Assam",
    "addressCountry": "India"
  },
  "url": CANONICAL_URL,
  "alumniOf": [
    {
      "@type": "EducationalOrganization",
      "name": "High School (Lakhimpur, Assam)",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lakhimpur",
        "addressRegion": "Assam",
        "addressCountry": "India"
      }
    }
  ],
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "High School Diploma / Secondary Education",
      "name": "High School Completion (Completed Feb 2026)",
      "dateCreated": "2026-02",
      "recognizedBy": {
        "@type": "EducationalOrganization",
        "name": "Secondary Education Board, Lakhimpur, Assam, India"
      }
    }
  ],
  "affiliation": [
    {
      "@type": "EducationalOrganization",
      "name": "Higher Secondary (Computer Science)",
      "description": "Currently pursuing Higher Secondary education with Computer Science in Lakhimpur, Assam, India",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lakhimpur",
        "addressRegion": "Assam",
        "addressCountry": "India"
      }
    }
  ],
  "image": {
    "@type": "ImageObject",
    "@id": `${CANONICAL_URL}/#primaryimage`,
    "url": `${CANONICAL_URL}/me.png`,
    "contentUrl": `${CANONICAL_URL}/me.png`,
    "caption": "Dev Borah (Bitupan Borah), Software Developer",
    "width": 1215,
    "height": 1295
  },
  "email": "bitzzdev@gmail.com",
  "jobTitle": "Software Developer & Web Developer",
  "description": "Dev Borah (legal name Bitupan Borah, online as Bitz, @bitz.dev, and @bitzzdev) is a software developer and systems creator from Lakhimpur, Assam, India.",
  "sameAs": [
    "https://github.com/bitzzdev",
    "https://gitlab.com/bitzzdev",
    "https://ko-fi.com/bitzzdev",
    "https://www.reddit.com/user/bitzzdev/",
    "https://x.com/bitzzdev",
    "https://twitter.com/bitzzdev",
    "https://www.linkedin.com/in/bitzzdev/",
    "https://orcid.org/0009-0004-2013-2999",
    "https://instagram.com/bitz.dev",
    "https://www.youtube.com/@bitzzzdev"
  ],
  "creator": [
    {
      "@type": "SoftwareSourceCode",
      "name": "DEVos",
      "codeRepository": "https://github.com/bitzzdev/DEVos",
      "programmingLanguage": "Python",
      "description": "Early native Linux project for the Realme C11 2021 (RMX3231): research, kernel/firmware analysis, boot/initramfs work, and custom Linux userspace."
    },
    {
      "@type": "SoftwareSourceCode",
      "name": "quickShelf",
      "codeRepository": "https://github.com/bitzzdev/quickShelf",
      "programmingLanguage": "Rust",
      "description": "Rust-based Wayland desktop widget and Waybar popover for pinned app shortcuts, image drop previews, and quick access to media and launcher actions."
    },
    {
      "@type": "SoftwareSourceCode",
      "name": "devSubstrate",
      "codeRepository": "https://github.com/bitzzdev/devSubstrate",
      "programmingLanguage": "Shell",
      "description": "A research substrate for modern engineering: AI API architectures, terminal-native agents, and OS repair notes."
    },
    {
      "@type": "SoftwareSourceCode",
      "name": "devLauncher",
      "codeRepository": "https://github.com/bitzzdev/devLauncher",
      "programmingLanguage": "Kotlin",
      "description": "Minimal Launcher for Android designed to reduce screen time with keyboard-driven access."
    },
    {
      "@type": "SoftwareSourceCode",
      "name": "bitzdots",
      "codeRepository": "https://github.com/bitzzdev/bitzdots",
      "programmingLanguage": "Shell",
      "description": "Lean Arch Linux Hyprland dotfiles with automatic wallust theming and low-end optimization."
    },
    {
      "@type": "SoftwareSourceCode",
      "name": "oha",
      "codeRepository": "https://github.com/bitzzdev/oha",
      "programmingLanguage": "C",
      "description": "Terminal-based fullscreen text editor written in C with syntax highlighting and file manager."
    }
  ],
  "knowsAbout": [
    "Rust",
    "Rust (Programming Language)",
    "TypeScript",
    "Next.js",
    "React",
    "C++",
    "C (Programming Language)",
    "Python",
    "JavaScript",
    "Java",
    "Arch Linux",
    "Linux",
    "Hyprland",
    "Fish Shell",
    "Bash Scripting",
    "Azure VPS",
    "Microsoft Azure",
    "Firebase",
    "Cloud Infrastructure",
    "Google Cloud Shell",
    "Zed Editor",
    "Neovim",
    "Git",
    "GitHub",
    "Systems Programming",
    "Command Line Interface (CLI)",
    "Web Performance Optimization"
  ],
  "mainEntityOfPage": {
    "@type": "ProfilePage",
    "@id": `${CANONICAL_URL}/#profilepage`
  }
};

const brandJsonLd = {
  "@type": "Brand",
  "@id": `${CANONICAL_URL}/#brand`,
  "name": "Bitz",
  "alternateName": ["bitz.dev", "bitzzdev", "Dev Borah"],
  "url": CANONICAL_URL,
  "logo": `${CANONICAL_URL}/favicon.png`,
  "founder": {
    "@id": `${CANONICAL_URL}/#person`
  }
};

const websiteJsonLd = {
  "@type": "WebSite",
  "@id": `${CANONICAL_URL}/#website`,
  "url": CANONICAL_URL,
  "name": "Bitz: Dev Borah",
  "alternateName": [
    "bitz.is-a.dev",
    "bitz.dev",
    "Dev Borah Portfolio",
    "Bitupan Borah Portfolio",
    "bitzzdev"
  ],
  "description": "Official personal website and developer portfolio of Dev Borah (Bitupan Borah), software developer and open source creator.",
  "publisher": {
    "@id": `${CANONICAL_URL}/#person`
  },
  "inLanguage": "en"
};

const profilePageJsonLd = {
  "@type": "ProfilePage",
  "@id": `${CANONICAL_URL}/#profilepage`,
  "url": CANONICAL_URL,
  "name": "Dev Borah (Bitupan Borah), Software Developer | bitz.dev",
  "isPartOf": {
    "@id": `${CANONICAL_URL}/#website`
  },
  "about": {
    "@id": `${CANONICAL_URL}/#person`
  },
  "mainEntity": {
    "@id": `${CANONICAL_URL}/#person`
  },
  "primaryImageOfPage": {
    "@id": `${CANONICAL_URL}/#primaryimage`
  }
};

const schemaGraph = {
  "@context": "https://schema.org",
  "@graph": [personJsonLd, brandJsonLd, websiteJsonLd, profilePageJsonLd]
};

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_URL),
  title: {
    default: "Dev Borah | bitzzdev | bitz.dev",
    template: "%s | Dev Borah",
  },
  description:
    "Official developer portfolio and open-source directory for Dev Borah (legal name Bitupan Borah, bitzzdev, bitz.dev): software developer and open-source creator from Lakhimpur, Assam, India. Creator of DEVos, quickShelf, devSubstrate, devLauncher, bitzdots, and oha.",
  authors: [{ name: "Dev Borah", url: CANONICAL_URL }],
  creator: "Dev Borah",
  publisher: "Dev Borah",
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: CANONICAL_URL,
    siteName: "Bitz: Dev Borah",
    title: "Dev Borah | bitzzdev | bitz.dev",
    description:
      "Official website and portfolio of Dev Borah (Bitupan Borah, @bitz.dev, @bitzzdev): software developer and open-source creator based in Assam, India.",
    firstName: "Dev",
    lastName: "Borah",
    username: "bitzzdev",
    gender: "male",
    images: [
      {
        url: "/me.png",
        width: 1215,
        height: 1295,
        alt: "Dev Borah (Bitupan Borah), Software Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bitzzdev",
    creator: "@bitzzdev",
    title: "Dev Borah | bitzzdev | bitz.dev",
    description:
      "Official portfolio of Dev Borah (Bitupan Borah, @bitz.dev, @bitzzdev): software developer in Assam, India.",
    images: ["/me.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  verification: {
    google: "google8c5cc6188709f829",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={paperMono.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var r=document.documentElement,s=null;try{s=localStorage.getItem("theme")}catch(e){}var t=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");r.dataset.theme=t;})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
