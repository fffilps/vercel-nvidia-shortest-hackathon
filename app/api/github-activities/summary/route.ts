import { NextResponse } from 'next/server';
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { RepoActivity } from '@/app/types/github';

// Create a custom instance with the API key
const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyAvA4MuVdCjRmRmUU1mAFbYsO9uKUg6abY"
});

export async function POST(request: Request) {
  try {
    const { commits, owner, repo } = await request.json();

    // Filter commits from last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 7);

    const recentCommits = commits.filter((commit: RepoActivity) => 
      new Date(commit.commit.author.date) > threeDaysAgo
    );

    if (recentCommits.length === 0) {
      return NextResponse.json("No commits found in the last 3 days.");
    }

    // Create a more detailed prompt
    const prompt = `Analyze these GitHub commits for the repository ${owner}/${repo} from the last 3 days:

Commit History:
${recentCommits.map((commit: RepoActivity) => `
Commit: ${commit.sha.substring(0, 7)}
Author: ${commit.commit.author.name}
Date: ${new Date(commit.commit.author.date).toLocaleString()}
Message: ${commit.commit.message}
`).join('\n')}

Please provide a concise summary in a first-person perspective that is positive and persuasive, including:
1. The main changes and their purpose
2. Overall impact of these changes
3. Any notable patterns or themes in the development
4. Technical details that stand out
5. Potential implications of these changes

Format the response in clear sections and keep it technical but accessible.`;

    const { text } = await generateText({
      model: google("models/gemini-2.0-flash"),
      prompt,
      temperature: 0.3,
      maxTokens: 1000,
    });

    return NextResponse.json(text);
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      'Failed to generate summary. Please try again.',
      { status: 500 }
    );
  }
} 