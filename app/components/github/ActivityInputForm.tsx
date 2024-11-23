'use client';

interface ActivityInputFormProps {
  trackingMode: 'repo' | 'user';
  githubUrl: string;
  username: string;
  loading: boolean;
  onGithubUrlChange: (url: string) => void;
  onUsernameChange: (username: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function ActivityInputForm({
  trackingMode,
  githubUrl,
  username,
  loading,
  onGithubUrlChange,
  onUsernameChange,
  onSubmit,
}: ActivityInputFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-8 space-y-4">
      {trackingMode === 'repo' ? (
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium mb-1 dark:text-gray-200">
            GitHub Repository URL
          </label>
          <input
            id="githubUrl"
            type="text"
            value={githubUrl}
            onChange={(e) => onGithubUrlChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://github.com/owner/repository"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Example: github.com/fffilps/upgraded-vercel-store
          </p>
        </div>
      ) : (
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1 dark:text-gray-200">
            GitHub Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="octocat"
            required
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        {loading ? 'Loading...' : `Get ${trackingMode === 'repo' ? 'Repository' : 'User'} Activities`}
      </button>
    </form>
  );
} 