/**
 * Single source of truth for the XEH (XEHhq) facts shown on this site.
 * Every value here was read from https://xeh.devs.surf, its
 * src/config/site.ts, and the gitlab.com/xehhq group. Update the source
 * there first, then mirror it here.
 */
export const xeh = {
  name: "XEH",
  tag: "hq",
  tagline: "Engineering beyond the ordinary.",
  description:
    "An independent open-source software organization building Linux tools, developer utilities, frontend systems, and practical software.",
  url: "https://xeh.devs.surf",
  gitlab: "https://gitlab.com/xehhq",
  contactEmail: "contact.xeh@gmail.com",
  foundedNote: "Independent and open source by default.",
} as const;

export type XehMember = {
  name: string;
  role: string;
  label: string;
  href: string;
  hrefLabel: string;
};

export const xehTeam: XehMember[] = [
  {
    name: "Abhilasha Ray",
    role: "Marketing head",
    label: "Lady of the team",
    href: "https://www.instagram.com/bwuberieee/",
    hrefLabel: "instagram.com/bwuberieee",
  },
  {
    name: "Biswajit Tanti",
    role: "Product lead and developer",
    label: "Product",
    href: "https://biswa.is-a.dev/",
    hrefLabel: "biswa.is-a.dev",
  },
  {
    name: "Dev Borah",
    role: "Founder and lead developer",
    label: "Founder",
    href: "https://bitz.is-a.dev/",
    hrefLabel: "bitz.is-a.dev",
  },
];

export const xehProducts = [
  {
    name: "DEVdots",
    status: "Under development",
    description:
      "A riced Arch Linux and Hyprland desktop UI in early development. It grows out of the dotfiles and desktop configuration work and follows the same rule as the web components: small composable parts, tuned defaults, and a desktop that stays out of the way.",
    href: "https://gitlab.com/xehhq/DEVdots",
    hrefLabel: "gitlab.com/xehhq/DEVdots",
  },
  {
    name: "XEHkit",
    status: "v0.4.2, 7 components",
    description:
      "A Next.js component library and the second product released by XEH. Every component lives in its own directory with a description.md that doubles as its documentation. Copy a directory, import xehkit.css once, and it works. Free for open source, personal, and portfolio use; commercial use needs a paid license.",
    href: "https://gitlab.com/xehhq/XEHkit",
    hrefLabel: "gitlab.com/xehhq/XEHkit",
  },
] as const;

export const xehFocus = [
  {
    title: "Linux systems",
    body: "Arch-focused tooling: post-install automation, dotfiles, window manager configurations, and maintenance utilities.",
  },
  {
    title: "Developer tools",
    body: "CLI utilities, git and repository tooling, environment automation, and workflow helpers for everyday engineering.",
  },
  {
    title: "UI systems",
    body: "Reusable React and Next.js components, design primitives, and accessible interface patterns for modern web work.",
  },
  {
    title: "Desktop applications",
    body: "Native, lightweight software that integrates with the operating system instead of layering over it.",
  },
  {
    title: "Automation and AI",
    body: "Agentic workflows and AI-assisted utilities with user-controlled configuration and transparent behavior.",
  },
  {
    title: "Open source",
    body: "Transparent development, clear licensing, practical documentation, and repositories people can build on.",
  },
] as const;

export const xehPhilosophy = [
  {
    title: "Practicality over complexity",
    body: "Every feature has a clear purpose. Straightforward implementations that are easy to understand and maintain.",
  },
  {
    title: "Lightweight by design",
    body: "No unnecessary dependencies, background processes, or bloated interfaces. Usable across a broad range of hardware.",
  },
  {
    title: "Open by default",
    body: "Transparent development people can inspect, understand, improve, and adapt.",
  },
  {
    title: "Modularity and composability",
    body: "Independent components with clear boundaries, predictable interfaces, and room to extend.",
  },
  {
    title: "Engineering quality",
    body: "Maintainable code, consistent architecture, meaningful documentation, sensible defaults, and practical testing.",
  },
  {
    title: "User control",
    body: "Transparent settings, self-hostable options where appropriate, and no unnecessary data collection.",
  },
  {
    title: "Continuous improvement",
    body: "Software is never finished. The work keeps being evaluated, refined, and learned from through practical use.",
  },
] as const;

export const xehTech = [
  "Arch Linux",
  "Linux",
  "Bash",
  "Fish",
  "Git",
  "Python",
  "Kotlin",
  "TypeScript",
  "Rust",
  "React",
  "Next.js",
  "Modern CSS",
  "Tailwind CSS",
  "AI model integrations",
  "Agentic workflows",
  "CLI automation",
] as const;

export const xehStats = [
  { label: "Tracking scripts", value: "0" },
  { label: "Focus areas", value: "6" },
  { label: "Engineering principles", value: "7" },
  { label: "Typefaces", value: "2" },
] as const;