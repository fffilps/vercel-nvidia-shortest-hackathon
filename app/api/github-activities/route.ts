import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/core';
import { supabase } from '@/lib/supabase';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function POST(request: Request) {
  try {
    const { owner, repo } = await request.json();

    // Get commits from GitHub
    const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Store commits in Supabase in the background
    const commits = response.data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name || 'Unknown',
      date: commit.commit.author?.date || new Date().toISOString(),
      repo_owner: owner,
      repo_name: repo,
      url: commit.html_url,
    }));

    // Fire and forget Supabase upsert - don't await it
    supabase
      .from('github_commits')
      .upsert(commits, {
        onConflict: 'sha',
        ignoreDuplicates: true
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error storing commits in Supabase:', error);
        }
      });

    // Return the original GitHub response data
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error handling commits:', error);
    return NextResponse.json(
      { error: 'Failed to handle repository commits' },
      { status: 500 }
    );
  }
} 