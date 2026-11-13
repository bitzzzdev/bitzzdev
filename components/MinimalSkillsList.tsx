"use client";

import Image from "next/image";
import styles from "./MinimalSkillsList.module.css";

interface SkillItem {
  name: string;
  icon: string;
  iconLight?: string;
  themeAware?: boolean;
}

interface SkillCategory {
  title: string;
  skills: SkillItem[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "languages",
    skills: [
      { name: "Rust", icon: "/icons/rust.svg" },
      { name: "C++", icon: "/icons/cpp.svg" },
      { name: "C", icon: "/icons/c.svg" },
      { name: "Python", icon: "/icons/python.svg" },
      { name: "JavaScript", icon: "/icons/javascript.svg" },
    ],
  },
  {
    title: "systems & os",
    skills: [
      { name: "Arch Linux", icon: "/icons/arch-linux.svg" },
      { name: "Linux", icon: "/icons/linux.svg" },
      { name: "Hyprland", icon: "/icons/hyprland.svg" },
    ],
  },
  {
    title: "cloud & infra",
    skills: [
      { name: "Azure VPS", icon: "/icons/azure.svg" },
      { name: "Firebase", icon: "/icons/firebase.svg" },
    ],
  },
  {
    title: "cli & shells",
    skills: [
      { name: "Fish", icon: "/icons/fish.svg" },
      { name: "Bash", icon: "/icons/bash.svg" },
      { name: "Google Cloud Shell", icon: "/icons/google-cloud-shell.svg" },
    ],
  },
  {
    title: "dev & tools",
    skills: [
      { name: "Zed", icon: "/icons/zed.svg", themeAware: true },
      { name: "Neovim", icon: "/icons/neovim.svg" },
      { name: "Git", icon: "/icons/git.svg" },
      { name: "GitHub", icon: "/icons/github.svg", themeAware: true },
      {
        name: "CircleCI",
        icon: "/icons/circleci.svg",
        iconLight: "/icons/circleci-light.svg",
      },
    ],
  },
];

export default function MinimalSkillsList() {
  return (
    <div className="mini-skills-wrap">
      <div className="mini-skills-head">
        <span className="dossier-label">Technical Stack &amp; Environment</span>
      </div>
      <div className="mini-skills-list">
        {SKILL_CATEGORIES.map((cat) => (
          <div key={cat.title} className="mini-skills-row">
            <span className="mini-skills-cat">{cat.title}</span>
            <div className="mini-skills-items">
              {cat.skills.map((skill) => (
                <span key={skill.name} className="mini-skill-pill">
                  {skill.iconLight ? (
                    <>
                      <Image
                        src={skill.iconLight}
                        alt=""
                        width={16}
                        height={16}
                        className={`mini-skill-icon ${styles.lightOnly}`}
                        unoptimized
                      />
                      <Image
                        src={skill.icon}
                        alt=""
                        width={16}
                        height={16}
                        className={`mini-skill-icon ${styles.darkOnly}`}
                        unoptimized
                      />
                    </>
                  ) : (
                    <Image
                      src={skill.icon}
                      alt=""
                      width={16}
                      height={16}
                      className={skill.themeAware ? "mini-skill-icon mini-skill-icon--theme-aware" : "mini-skill-icon"}
                      unoptimized
                    />
                  )}
                  <span className="mini-skill-name">{skill.name}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
