import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { simpleGit } from 'simple-git';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, remotes } = await request.json();
    // remotes: ['origin', 'gitlab', 'bitzzzdev'] - which remotes to push to

    if (!message) {
      return NextResponse.json({ error: 'Commit message required' }, { status: 400 });
    }

    const repoPath = process.cwd();
    const git = simpleGit(repoPath);

    // Check if there are changes
    const status = await git.status();
    if (status.files.length === 0) {
      return NextResponse.json({ error: 'No changes to commit' }, { status: 400 });
    }

    // Add all changes
    await git.add('.');

    // Commit
    await git.commit(message);

    // Push to specified remotes
    const pushRemotes = remotes || ['origin'];
    const results = [];

    for (const remote of pushRemotes) {
      try {
        await git.push(remote, 'dev');
        results.push({ remote, success: true });
      } catch (error) {
        results.push({ remote, success: false, error: String(error) });
      }
    }

    return NextResponse.json({ success: true, commit: message, pushes: results });
  } catch (error) {
    console.error('Git push error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}