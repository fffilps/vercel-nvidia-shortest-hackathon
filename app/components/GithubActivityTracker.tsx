'use client';

import { useState, useMemo } from 'react';

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

function Modal({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium mb-1">
            GitHub Repository URL
          </label>
          <input
            id="githubUrl"
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="https://github.com/owner/repository"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Example: github.com/fffilps/upgraded-vercel-store
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Activities'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-md">{error}</div>
      )}

      {activities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Repository Activities</h2>
              <p className="text-sm text-gray-600">
                {owner}/{repo}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="authorFilter" className="text-sm font-medium">
                Filter by author:
              </label>
              <input
                id="authorFilter"
                type="text"
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
                placeholder="Enter username..."
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredActivities.length} of {activities.length} commits
            {authorFilter && ` (filtered by "${authorFilter}")`}
          </div>

          {selectedCommits.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Selected Commits: {selectedCommits.length}/2</h3>
                  <p className="text-sm text-gray-600">Select two commits to compare</p>
                </div>
                <button
                  onClick={handleCompare}
                  disabled={selectedCommits.length !== 2 || comparing}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
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
            {comparison && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Comparison Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-lg font-medium text-green-700">
                      +{comparison.base_commit.stats.additions + comparison.head_commit.stats.additions}
                    </div>
                    <div className="text-sm text-green-600">Additions</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <div className="text-lg font-medium text-red-700">
                      -{comparison.base_commit.stats.deletions + comparison.head_commit.stats.deletions}
                    </div>
                    <div className="text-sm text-red-600">Deletions</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-medium">
                      {comparison.base_commit.files.length + comparison.head_commit.files.length}
                    </div>
                    <div className="text-sm text-gray-600">Files Changed</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {[...comparison.base_commit.files, ...comparison.head_commit.files].map((file) => (
                    <div key={file.filename} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{file.filename}</span>
                        <div className="space-x-2 text-sm">
                          <span className="text-green-600">+{file.additions}</span>
                          <span className="text-red-600">-{file.deletions}</span>
                        </div>
                      </div>
                      {file.patch && (
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {file.patch.split('\n').map((line, i) => {
                            let lineClass = '';
                            if (line.startsWith('+')) {
                              lineClass = 'bg-green-100 text-green-800';
                            } else if (line.startsWith('-')) {
                              lineClass = 'bg-red-100 text-red-800';
                            } else if (line.startsWith('@@ ')) {
                              lineClass = 'bg-blue-100 text-blue-800';
                            }
                            
                            return (
                              <div key={i} className={`${lineClass} px-1 font-mono whitespace-pre`}>
                                {line}
                              </div>
                            );
                          })}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Modal>

          <div className="space-y-2">
            {filteredActivities.map((activity) => (
              <div
                key={activity.node_id}
                className={`p-4 border rounded-md hover:bg-gray-50 cursor-pointer ${
                  selectedCommits.includes(activity.sha) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleCommitSelect(activity.sha)}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={activity.author?.avatar_url}
                    alt={activity.author?.login}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <span className="font-medium">{activity.author?.login}</span>
                    <p className="text-sm text-gray-600">
                      {activity.commit.message}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <a 
                    href={activity.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {activity.sha.substring(0, 7)}
                  </a>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(activity.commit.author.date).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 