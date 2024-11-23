'use client';

import { useState, useMemo } from 'react';
import { ComparisonView } from './github/ComparisonView';
import { Modal } from './ui/Modal';
import { TwitterShareButton } from './Twitter-share-button';
import { TrackingModeSwitch } from './github/TrackingModeSwitch';
import { ActivityInputForm } from './github/ActivityInputForm';
import { UserActivitiesList } from './github/UserActivitiesList';
import { RepoActivitiesList } from './github/RepoActivitiesList';
import { RepoActivity, CompareResult, UserActivity } from '@/app/types/github';

// Helper function to truncate text for Twitter
function truncateForTwitter(text: string, maxLength: number = 280): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export default function GithubActivityTracker() {
  // State for both modes
  const [trackingMode, setTrackingMode] = useState<'repo' | 'user'>('repo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Repository tracking state
  const [githubUrl, setGithubUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [activities, setActivities] = useState<RepoActivity[]>([]);
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // User tracking state
  const [username, setUsername] = useState('');
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);

  // Modal state
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
      console.error('Error parsing GitHub URL:', err);
      return null;
    }
  };

  const filteredActivities = useMemo(() => {
    if (!authorFilter) return activities;
    
    return activities.filter(activity => 
      activity.author?.login.toLowerCase().includes(authorFilter.toLowerCase()) ||
      activity.commit.author.name.toLowerCase().includes(authorFilter.toLowerCase()) ||
      activity.commit.author.email.toLowerCase().includes(authorFilter.toLowerCase())
    );
  }, [activities, authorFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAuthorFilter('');

    try {
      if (trackingMode === 'repo') {
        const parsed = parseGithubUrl(githubUrl.trim());
        
        if (!parsed) {
          throw new Error('Invalid GitHub URL');
        }

        setOwner(parsed.owner);
        setRepo(parsed.repo);

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
      } else {
        if (!username.trim()) {
          throw new Error('Username is required');
        }

        const response = await fetch('/api/github-activities/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: username.trim() }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user activities');
        }

        const data = await response.json();
        setUserActivities(data);
      }
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

  const handleGenerateSummary = async () => {
    setSummarizing(true);
    setSummary(null);
    setError('');

    try {
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

      const data = await response.json();
      setSummary(data);
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const handleModeChange = (mode: 'repo' | 'user') => {
    setTrackingMode(mode);
    setActivities([]);
    setUserActivities([]);
    setError('');
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
      <h1 className="text-2xl font-bold mb-6 dark:text-white">GitHub Activity Tracker</h1>
      
      <TrackingModeSwitch 
        trackingMode={trackingMode} 
        onModeChange={handleModeChange} 
      />

      <ActivityInputForm
        trackingMode={trackingMode}
        githubUrl={githubUrl}
        username={username}
        loading={loading}
        onGithubUrlChange={setGithubUrl}
        onUsernameChange={setUsername}
        onSubmit={handleSubmit}
      />

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md dark:text-red-400">
          {error}
        </div>
      )}

      {trackingMode === 'repo' && (
        <RepoActivitiesList
          activities={activities}
          filteredActivities={filteredActivities}
          owner={owner}
          repo={repo}
          authorFilter={authorFilter}
          selectedCommits={selectedCommits}
          onAuthorFilterChange={setAuthorFilter}
          onCommitSelect={handleCommitSelect}
          onGenerateSummary={handleGenerateSummary}
          onCompare={handleCompare}
          summarizing={summarizing}
          comparing={comparing}
        />
      )}

      {trackingMode === 'user' && (
        <UserActivitiesList
          activities={userActivities}
          username={username}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      >
        {comparison && <ComparisonView comparison={comparison} />}
        {summary && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold dark:text-white">Activity Summary</h3>
              <TwitterShareButton
                text={truncateForTwitter(`GitHub Activity Summary for ${owner}/${repo}:\n\n${summary}`)}
                url={`https://github.com/${owner}/${repo}`}
                hashtags={['GitHub', 'DevActivity']}
                className="ml-4"
              />
            </div>
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
    </div>
  );
} 