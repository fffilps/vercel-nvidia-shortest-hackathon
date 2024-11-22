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

export interface FileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface CommitStats {
  total: number;
  additions: number;
  deletions: number;
}

export interface CompareResult {
  files: FileChange[];
  total_commits: number;
  ahead_by: number;
  behind_by: number;
  base_commit: {
    stats: CommitStats;
    files: FileChange[];
  };
  head_commit: {
    stats: CommitStats;
    files: FileChange[];
  };
}

export interface Summary {
  summary: string;
}

export interface StatCardProps {
  value: number;
  label: string;
  type: 'addition' | 'deletion' | 'neutral';
}

export interface CommitCardProps {
  activity: RepoActivity;
  isSelected: boolean;
  onSelect: (sha: string) => void;
}

export interface ComparisonViewProps {
  comparison: CompareResult;
}

export interface FileChangeCardProps {
  file: FileChange;
}

export interface CodeDiffProps {
  patch: string;
} 