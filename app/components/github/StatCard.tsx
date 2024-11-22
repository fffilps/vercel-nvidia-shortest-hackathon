import { StatCardProps } from '@/app/types/github';

export function StatCard({ value, label, type }: StatCardProps) {
  const getStyles = () => {
    switch (type) {
      case 'addition':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'deletion':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`p-2 rounded ${getStyles()}`}>
      <div className="text-lg font-medium">
        {type === 'addition' && '+'}
        {type === 'deletion' && '-'}
        {value}
      </div>
      <div className="text-sm">{label}</div>
    </div>
  );
} 