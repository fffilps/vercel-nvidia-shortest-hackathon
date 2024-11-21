import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/core';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function POST(request: Request) {
  try {
    const { owner, repo, base, head } = await request.json();
    
    console.log('Comparing commits:', { owner, repo, base, head });

    // First get the full commit details for both commits
    const [baseCommit, headCommit] = await Promise.all([
      octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
        owner,
        repo,
        ref: base,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }),
      octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
        owner,
        repo,
        ref: head,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
    ]);

    console.log('Base commit:', baseCommit.data);
    console.log('Head commit:', headCommit.data);

    // Then get the comparison between them
    const comparison = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
      owner,
      repo,
      basehead: `${base}...${head}`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    console.log('Comparison response:', comparison.data);

    // Log the calculated stats
    const stats = {
      total_additions: comparison.data.files?.reduce((sum, file) => sum + file.additions, 0) || 0,
      total_deletions: comparison.data.files?.reduce((sum, file) => sum + file.deletions, 0) || 0,
      total_changes: comparison.data.files?.reduce((sum, file) => sum + file.changes, 0) || 0,
    };
    console.log('Calculated stats:', stats);

    // Combine the data
    const responseData = {
      files: comparison.data.files,
      total_commits: comparison.data.total_commits,
      ahead_by: comparison.data.ahead_by,
      behind_by: comparison.data.behind_by,
      base_commit: baseCommit.data,
      head_commit: headCommit.data,
      commits: comparison.data.commits,
      stats
    };

    console.log('Final response data:', responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error comparing commits:', error);
    return NextResponse.json(
      { error: 'Failed to compare commits' },
      { status: 500 }
    );
  }
} 