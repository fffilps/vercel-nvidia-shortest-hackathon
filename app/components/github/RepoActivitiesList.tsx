'use client';

import { RepoActivity } from '@/app/types/github';
import { CommitCard } from './CommitCard';

interface RepoActivitiesListProps {
  activities: RepoActivity[];
  filteredActivities: RepoActivity[];
  owner: string;
  repo: string;
  authorFilter: string;
  selectedCommits: string[];
  onAuthorFilterChange: (filter: string) => void;
  onCommitSelect: (sha: string) => void;
  onGenerateSummary: () => void;
  onCompare: () => void;
  summarizing: boolean;
  comparing: boolean;
}

export function RepoActivitiesList({
  activities,
  filteredActivities,
  owner,
  repo,
  authorFilter,
  selectedCommits,
  onAuthorFilterChange,
  onCommitSelect,
  onGenerateSummary,
  onCompare,
  summarizing,
  comparing,
}: RepoActivitiesListProps) {
  if (activities.length === 0) return null;

  return (
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
            onClick={onGenerateSummary}
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
              onChange={(e) => onAuthorFilterChange(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter username..."
            />
          </div>
        </div>
      </div>

      {selectedCommits.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium dark:text-white">Selected Commits: {selectedCommits.length}/2</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select two commits to compare</p>
            </div>
            <button
              onClick={onCompare}
              disabled={selectedCommits.length !== 2 || comparing}
              className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {comparing ? 'Comparing...' : 'Compare'}
            </button>
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredActivities.length} of {activities.length} commits
        {authorFilter && ` (filtered by "${authorFilter}")`}
      </div>

      <div className="space-y-2">
        {filteredActivities.map((activity) => (
          <CommitCard
            key={activity.node_id}
            activity={activity}
            isSelected={selectedCommits.includes(activity.sha)}
            onSelect={onCommitSelect}
          />
        ))}
      </div>
    </div>
  );
} 