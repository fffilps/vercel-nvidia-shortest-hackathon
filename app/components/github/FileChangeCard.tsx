import { FileChangeCardProps } from '@/app/types/github';
import { CodeDiff } from './CodeDiff';

export function FileChangeCard({ file }: FileChangeCardProps) {
  return (
    <div className="border dark:border-gray-700 rounded p-3 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm dark:text-gray-200">{file.filename}</span>
        <div className="space-x-2 text-sm">
          <span className="text-green-600 dark:text-green-400">+{file.additions}</span>
          <span className="text-red-600 dark:text-red-400">-{file.deletions}</span>
        </div>
      </div>
      {file.patch && <CodeDiff patch={file.patch} />}
    </div>
  );
} 