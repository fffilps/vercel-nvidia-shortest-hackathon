export interface GitUser {
  name: string;
  email: string;
  date: string;
}

export interface CommitDetails {
  url: string;
  author: GitUser;
  committer: GitUser;
  message: string;
  comment_count: number;
}

export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface CommitParent {
  url: string;
  sha: string;
}

export interface RepoActivity {
  url: string;
  sha: string;
  node_id: string;
  html_url: string;
  commit: CommitDetails;
  author: GithubUser;
  committer: GithubUser;
  parents: CommitParent[];
}

export interface CompareResult {
  files: FileChange[];
  total_commits: number;
  ahead_by: number;
  behind_by: number;
  base_commit: CommitChange;
  head_commit: CommitChange;
}

export interface FileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface CommitChange {
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
  files: FileChange[];
}

export interface UserActivity {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: {
    description?: string;
    commits?: Array<{
      message: string;
    }>;
    pull_request?: {
      title: string;
    };
    issue?: {
      title: string;
    };
  };
  created_at: string;
}

export interface CodeDiffProps {
  patch: string;
}

export interface CommitCardProps {
  activity: {
    sha: string;
    author: {
      avatar_url: string;
      login: string;
    };
    commit: {
      message: string;
      author: {
        date: string;
      };
    };
    html_url: string;
    type: 'pull' | 'commit';
  };
  isSelected: boolean;
  onSelect: (sha: string) => void;
}

export interface FileChangeCardProps {
  file: {
    filename: string;
    additions: number;
    deletions: number;
    patch?: string;
  };
}

export interface ComparisonViewProps {
  comparison: {
    base_commit: {
      stats: {
        additions: number;
        deletions: number;
      };
      files: Array<{
        filename: string;
        // ... other file properties used in FileChangeCard
      }>;
    };
    head_commit: {
      stats: {
        additions: number;
        deletions: number;
      };
      files: Array<{
        filename: string;
        // ... other file properties used in FileChangeCard
      }>;
    };
  };
}

export type StatCardProps = {
  value: number | string;
  label: string;
  type?: 'addition' | 'deletion' | 'default';
}; 