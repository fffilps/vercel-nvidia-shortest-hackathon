import { CodeDiffProps } from '@/app/types/github';

export function CodeDiff({ patch }: CodeDiffProps) {
  return (
    <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
      {patch.split('\n').map((line, i) => {
        let lineClass = '';
        if (line.startsWith('+')) {
          lineClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        } else if (line.startsWith('-')) {
          lineClass = 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        } else if (line.startsWith('@@ ')) {
          lineClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        } else {
          lineClass = 'dark:text-gray-300';
        }
        
        return (
          <div key={i} className={`${lineClass} px-1 font-mono whitespace-pre`}>
            {line}
          </div>
        );
      })}
    </pre>
  );
} 