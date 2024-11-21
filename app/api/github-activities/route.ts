import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/core';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function POST(request: Request) {
  try {
    const { owner, repo } = await request.json();

    const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching repository commits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository commits' },
      { status: 500 }
    );
  }
} 