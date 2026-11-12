import { NextResponse } from "next/server";
import { getPublicRepos } from "@/lib/github";

export const revalidate = 300;

export async function GET() {
  const repos = await getPublicRepos();
  return NextResponse.json({ repos });
}
