import { ComparisonViewProps } from '@/app/types/github';
import { StatCard } from './StatCard';
import { FileChangeCard } from './FileChangeCard';

export function ComparisonView({ comparison }: ComparisonViewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold dark:text-white">Comparison Summary</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <StatCard
          value={comparison.base_commit.stats.additions + comparison.head_commit.stats.additions}
          label="Additions"
          type="addition"
        />
        <StatCard
          value={comparison.base_commit.stats.deletions + comparison.head_commit.stats.deletions}
          label="Deletions"
          type="deletion"
        />
        <StatCard
          value={comparison.base_commit.files.length + comparison.head_commit.files.length}
          label="Files Changed"
          type="default"
        />
      </div>

      <div className="space-y-2">
        {[...comparison.base_commit.files, ...comparison.head_commit.files].map((file: {
          filename: string;
          additions?: number;
          deletions?: number;
          patch?: string;
        }) => (
          <FileChangeCard 
            key={file.filename} 
            file={{
              filename: file.filename,
              additions: file.additions || 0,
              deletions: file.deletions || 0,
              patch: file.patch
            }} 
          />
        ))}
      </div>
    </div>
  );
} 