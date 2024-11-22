import { Octokit } from '@octokit/core';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const response = await octokit.request('GET /users/{username}/events/public', {
      username,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      },
      per_page: 100
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      'Failed to fetch user activities',
      { status: 500 }
    );
  }
} 