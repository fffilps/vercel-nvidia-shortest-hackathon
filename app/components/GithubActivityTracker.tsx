'use client';

import { useState, useMemo } from 'react';
import { CommitCard } from './github/CommitCard';
import { ComparisonView } from './github/ComparisonView';
import { Modal } from './ui/Modal';

interface GitUser {
  name: string;
  email: string;
  date: string;
}

interface CommitDetails {
  url: string;
  author: GitUser;
  committer: GitUser;
  message: string;
  comment_count: number;
}

interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

interface CommitParent {
  url: string;
  sha: string;
}

interface RepoActivity {
  url: string;
  sha: string;
  node_id: string;
  html_url: string;
  commit: CommitDetails;
  author: GithubUser;
  committer: GithubUser;
  parents: CommitParent[];
}

interface CompareResult {
  files: {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }[];
  total_commits: number;
  ahead_by: number;
  behind_by: number;
  base_commit: {
    stats: {
      total: number;
      additions: number;
      deletions: number;
    };
    files: {
      filename: string;
      status: string;
      additions: number;
      deletions: number;
      changes: number;
      patch?: string;
    }[];
  };
  head_commit: {
    stats: {
      total: number;
      additions: number;
      deletions: number;
    };
    files: {
      filename: string;
      status: string;
      additions: number;
      deletions: number;
      changes: number;
      patch?: string;
    }[];
  };
}

interface Summary {
  summary: string;
}

export default function GithubActivityTracker() {
  const [githubUrl, setGithubUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [activities, setActivities] = useState<RepoActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
    try {
      const urlPatterns = [
        /github\.com\/([^/]+)\/([^/]+)\/?$/,              // github.com/owner/repo
        /github\.com\/([^/]+)\/([^/]+)\/?.*/,             // github.com/owner/repo/anything
        /^(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)/, // https://github.com/owner/repo
        /^([^/]+)\/([^/]+)$/,                             // owner/repo
      ];

      for (const pattern of urlPatterns) {
        const match = url.match(pattern);
        if (match) {
          return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, '') // Remove .git if present
          };
        }
      }
      return null;
    } catch (err) {
      console.error('Error parsing GitHub URL:', err);
      return null;
    }
  };

  const filteredActivities = useMemo(() => {
    if (!authorFilter) return activities;
    
    const filtered = activities.filter(activity => 
      activity.author?.login.toLowerCase().includes(authorFilter.toLowerCase()) ||
      activity.commit.author.name.toLowerCase().includes(authorFilter.toLowerCase()) ||
      activity.commit.author.email.toLowerCase().includes(authorFilter.toLowerCase())
    );
    
    console.log(`Found ${filtered.length} commits by author matching "${authorFilter}"`);
    return filtered;
  }, [activities, authorFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAuthorFilter('');

    const parsed = parseGithubUrl(githubUrl.trim());
    
    if (!parsed) {
      setError('Invalid GitHub URL. Please enter a valid GitHub repository URL.');
      setLoading(false);
      return;
    }

    setOwner(parsed.owner);
    setRepo(parsed.repo);

    try {
      const response = await fetch('/api/github-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repository activities');
      }

      const data = await response.json();
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitSelect = (sha: string) => {
    setComparison(null);
    setError('');
    
    setSelectedCommits(prev => {
      if (prev.includes(sha)) {
        return prev.filter(s => s !== sha);
      }
      if (prev.length >= 2) {
        return [prev[1], sha];
      }
      return [...prev, sha];
    });
  };

  const handleCompare = async () => {
    if (selectedCommits.length !== 2) return;
    
    setComparing(true);
    setComparison(null);
    setError('');
    setIsModalOpen(true);

    const firstCommit = activities.find(a => a.sha === selectedCommits[0]);
    const secondCommit = activities.find(a => a.sha === selectedCommits[1]);

    if (!firstCommit || !secondCommit) {
      setError('Selected commits not found');
      setComparing(false);
      return;
    }

    const firstDate = new Date(firstCommit.commit.author.date);
    const secondDate = new Date(secondCommit.commit.author.date);
    
    const [base, head] = firstDate < secondDate 
      ? [firstCommit.sha, secondCommit.sha]
      : [secondCommit.sha, firstCommit.sha];

    console.log('Comparing commits:', {
      owner,
      repo,
      base,
      head
    });

    try {
      const response = await fetch('/api/github-activities/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          base,
          head,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compare commits');
      }

      const data = await response.json();
      console.log('Comparison response from API:', data);
      
      if (!data.base_commit || !data.head_commit) {
        throw new Error('Invalid comparison data received');
      }

      setComparison(data);
    } catch (err) {
      console.error('Error in comparison:', err);
      setError(err instanceof Error ? err.message : 'An error occurred comparing commits');
      setComparison(null);
    } finally {
      setComparing(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummarizing(true);
    setSummary(null);
    setError('');

    try {
      // Get commits from the last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const recentCommits = activities.filter(activity => 
        new Date(activity.commit.author.date) > threeDaysAgo
      );

      if (recentCommits.length === 0) {
        throw new Error('No commits found in the last 3 days');
      }

      const response = await fetch('/api/github-activities/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commits: recentCommits,
          owner,
          repo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data: Summary = await response.json();
      console.log('Summary response from API:', data);
      setSummary(data.summary);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium mb-1 dark:text-gray-200">
            GitHub Repository URL
          </label>
          <input
            id="githubUrl"
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://github.com/owner/repository"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Example: github.com/fffilps/upgraded-vercel-store
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {loading ? 'Loading...' : 'Get Activities'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md dark:text-red-400">{error}</div>
      )}

      {activities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold dark:text-white">Repository Activities</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {owner}/{repo}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerateSummary}
                disabled={summarizing || activities.length === 0}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700"
              >
                {summarizing ? 'Generating Summary...' : 'Summarize Recent Changes'}
              </button>
              <div className="flex items-center gap-2">
                <label htmlFor="authorFilter" className="text-sm font-medium dark:text-gray-200">
                  Filter by author:
                </label>
                <input
                  id="authorFilter"
                  type="text"
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter username..."
                />
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredActivities.length} of {activities.length} commits
            {authorFilter && ` (filtered by "${authorFilter}")`}
          </div>

          {selectedCommits.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium dark:text-white">Selected Commits: {selectedCommits.length}/2</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Select two commits to compare</p>
                </div>
                <button
                  onClick={handleCompare}
                  disabled={selectedCommits.length !== 2 || comparing}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {comparing ? 'Comparing...' : 'Compare'}
                </button>
              </div>
            </div>
          )}

          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
          >
            {comparison && <ComparisonView comparison={comparison} />}
            {summary && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold dark:text-white">Activity Summary</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    {summary.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Modal>

          <div className="space-y-2">
            {filteredActivities.map((activity) => (
              <CommitCard
                key={activity.node_id}
                activity={activity}
                isSelected={selectedCommits.includes(activity.sha)}
                onSelect={handleCommitSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 