"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface BranchPickerProps {
  branches: string[];
  defaultBranch: string;
  current: string;
}

export default function BranchPicker({ branches, defaultBranch, current }: BranchPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("ref", e.target.value);
      params.delete("page");
      // Tree paths are branch specific; drop stale paths on branch switch.
      if (params.get("tab") === "files" || params.get("tab") === "file") {
        params.delete("path");
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <label className="repo-branch-picker">
      <span className="sr-only">Branch</span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <path d="M18 8.5a9 9 0 0 1-9 9" />
      </svg>
      <select value={current} onChange={onChange} aria-label="Switch branch">
        {branches.map((branch) => (
          <option key={branch} value={branch}>
            {branch}
            {branch === defaultBranch ? " (default)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
